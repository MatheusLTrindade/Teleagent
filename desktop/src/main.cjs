const {
	app,
	BrowserWindow,
	Tray,
	Menu,
	nativeImage,
	shell,
	ipcMain,
	screen,
} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const http = require('node:http');
const os = require('node:os');
const {
	setupAutoUpdater,
	getUpdateState,
	checkForUpdates,
	downloadUpdate,
	installUpdateAndRestart,
} = require('./updater.cjs');

const DEFAULT_PORT = 3847;
const isDev = !app.isPackaged;

/** @type {import('electron').BrowserWindow | null} */
let hubWindow = null;
/** @type {import('electron').Tray | null} */
let tray = null;
/** @type {import('node:child_process').ChildProcess | null} */
let bridgeProc = null;
/** @type {string[]} */
const recentLogs = [];
let startHidden = process.argv.includes('--hidden');

function iconPath(name) {
	return path.join(__dirname, '..', 'icons', name);
}

function configDir() {
	return path.join(os.homedir(), '.teleagent');
}

function configPath() {
	return path.join(configDir(), 'config.json');
}

function desktopPrefsPath() {
	return path.join(configDir(), 'desktop.json');
}

function readConfig() {
	try {
		return JSON.parse(fs.readFileSync(configPath(), 'utf8'));
	} catch {
		return {};
	}
}

function writeConfig(next) {
	fs.mkdirSync(configDir(), { recursive: true });
	const current = readConfig();
	const merged = {
		botToken: next.botToken ?? current.botToken ?? '',
		chatId: next.chatId ?? current.chatId ?? '',
		allowedUserIds: Array.isArray(next.allowedUserIds)
			? next.allowedUserIds
			: current.allowedUserIds || [],
		port: Number(next.port ?? current.port ?? DEFAULT_PORT) || DEFAULT_PORT,
		host: next.host ?? current.host ?? '127.0.0.1',
	};
	fs.writeFileSync(
		configPath(),
		JSON.stringify(merged, null, 2) + '\n',
		'utf8',
	);
	return merged;
}

function readDesktopPrefs() {
	try {
		return JSON.parse(fs.readFileSync(desktopPrefsPath(), 'utf8'));
	} catch {
		return {};
	}
}

function writeDesktopPrefs(partial) {
	fs.mkdirSync(configDir(), { recursive: true });
	const next = { ...readDesktopPrefs(), ...partial };
	fs.writeFileSync(
		desktopPrefsPath(),
		JSON.stringify(next, null, 2) + '\n',
		'utf8',
	);
	return next;
}

function applyAutostart(enabled) {
	const want = Boolean(enabled);
	const settings = {
		openAtLogin: want,
		openAsHidden: true,
		name: 'Teleagent',
	};
	if (app.isPackaged) {
		settings.path = process.execPath;
		settings.args = ['--hidden'];
	} else {
		// Em dev, registra o Electron com o app path para conseguir testar.
		settings.path = process.execPath;
		settings.args = [app.getAppPath(), '--hidden'];
	}
	app.setLoginItemSettings(settings);
	writeDesktopPrefs({ autostart: want });
	const confirmed = app.getLoginItemSettings().openAtLogin;
	pushLog(
		want
			? confirmed
				? 'Autostart: ativado (inicia com o Windows).'
				: 'Autostart: pedido enviado (confira em Configurações → Aplicativos → Inicializar).'
			: 'Autostart: desativado.',
	);
	return { ok: true, autostart: confirmed || want, confirmed };
}

function bridgeEntry() {
	if (isDev) {
		return path.join(__dirname, '..', '..', 'dist', 'index.js');
	}
	const bundled = path.join(process.resourcesPath, 'bridge', 'bridge.cjs');
	if (fs.existsSync(bundled)) return bundled;
	return path.join(process.resourcesPath, 'bridge', 'dist', 'index.js');
}

function bridgeCwd() {
	if (isDev) {
		return path.join(__dirname, '..', '..');
	}
	return path.join(process.resourcesPath, 'bridge');
}

function pushLog(line) {
	const stamped = `[${new Date().toLocaleTimeString()}] ${line}`;
	recentLogs.push(stamped);
	if (recentLogs.length > 200) recentLogs.shift();
	hubWindow?.webContents.send('logs', stamped);
}

function isBridgeRunning() {
	return Boolean(
		bridgeProc && !bridgeProc.killed && bridgeProc.exitCode === null,
	);
}

function requestJson(method, pathname, body) {
	const cfg = readConfig();
	const port = Number(cfg.port) || DEFAULT_PORT;
	const payload = body ? JSON.stringify(body) : null;
	return new Promise((resolve, reject) => {
		const req = http.request(
			{
				hostname: '127.0.0.1',
				port,
				path: pathname,
				method,
				headers: {
					'Content-Type': 'application/json',
					...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
				},
				timeout: 8000,
			},
			(res) => {
				let raw = '';
				res.on('data', (c) => {
					raw += c;
				});
				res.on('end', () => {
					try {
						resolve({
							status: res.statusCode || 0,
							body: raw ? JSON.parse(raw) : {},
						});
					} catch {
						resolve({ status: res.statusCode || 0, body: { raw } });
					}
				});
			},
		);
		req.on('error', reject);
		req.on('timeout', () => {
			req.destroy();
			reject(new Error('timeout'));
		});
		if (payload) req.write(payload);
		req.end();
	});
}

function healthCheck() {
	return requestJson('GET', '/health')
		.then((r) => (r.status === 200 ? r.body : null))
		.catch(() => null);
}

async function getStatus() {
	const health = await healthCheck();
	const cfg = readConfig();
	const prefs = readDesktopPrefs();
	const login = app.getLoginItemSettings();
	return {
		running: isBridgeRunning() || Boolean(health?.ok),
		managed: isBridgeRunning(),
		health,
		version: app.getVersion(),
		update: getUpdateState(),
		config: {
			botToken: cfg.botToken || '',
			hasToken: Boolean(cfg.botToken),
			chatId: cfg.chatId || '',
			port: cfg.port || DEFAULT_PORT,
			host: cfg.host || '127.0.0.1',
			allowedUserIds: cfg.allowedUserIds || [],
		},
		autostart: Boolean(login.openAtLogin || prefs.autostart),
		logs: recentLogs.slice(-80),
	};
}

async function startBridge() {
	if (isBridgeRunning()) {
		pushLog('Bridge já em execução (gerenciado pelo app).');
		return { ok: true };
	}
	const health = await healthCheck();
	if (health?.ok) {
		pushLog('Bridge já online em 127.0.0.1 (outro processo).');
		updateTrayMenu();
		return { ok: true, external: true };
	}
	const entry = bridgeEntry();
	if (!fs.existsSync(entry)) {
		pushLog(
			isDev
				? `Bridge não encontrado: ${entry}. Rode npm run build na raiz.`
				: `Bridge não encontrado: ${entry}. Reinstale pelo Setup oficial (release com bridge empacotado).`,
		);
		return { ok: false, error: 'bridge_missing' };
	}
	const child = spawn(process.execPath, [entry, 'serve'], {
		cwd: bridgeCwd(),
		env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
		stdio: ['ignore', 'pipe', 'pipe'],
		windowsHide: true,
	});
	bridgeProc = child;
	pushLog('Iniciando bridge...');
	child.stdout?.on('data', (buf) => {
		String(buf)
			.split(/\r?\n/)
			.filter(Boolean)
			.forEach((line) => pushLog(line));
	});
	child.stderr?.on('data', (buf) => {
		String(buf)
			.split(/\r?\n/)
			.filter(Boolean)
			.forEach((line) => pushLog(line));
	});
	child.on('exit', (code) => {
		pushLog(`Bridge encerrado (code ${code})`);
		if (bridgeProc === child) bridgeProc = null;
		updateTrayMenu();
		hubWindow?.webContents.send('status', null);
	});
	updateTrayMenu();
	return { ok: true };
}

async function stopBridge() {
	if (!isBridgeRunning()) {
		pushLog('Nenhum bridge gerenciado pelo app para parar.');
		return { ok: true };
	}
	pushLog('Parando bridge...');
	const child = bridgeProc;
	bridgeProc = null;
	try {
		child.kill('SIGTERM');
	} catch {
		/* ignore */
	}
	setTimeout(() => {
		try {
			if (child && child.exitCode === null) child.kill('SIGKILL');
		} catch {
			/* ignore */
		}
	}, 3000);
	updateTrayMenu();
	return { ok: true };
}

async function sendTestAlert() {
	const health = await healthCheck();
	if (!health?.ok) {
		pushLog('Teste falhou: bridge offline. Inicie o serviço antes.');
		return { ok: false, error: 'bridge_offline' };
	}
	try {
		const res = await requestJson('POST', '/v1/alert', {
			project: 'teleagent',
			level: 'info',
			message:
				'Teste do hub Teleagent — se você viu isso no Telegram, está ok.',
		});
		if (res.status >= 200 && res.status < 300) {
			pushLog(`Teste ok → alerta ${res.body.id || ''} enviado.`);
			return { ok: true, ...res.body };
		}
		pushLog(`Teste falhou: ${res.body.error || res.status}`);
		return { ok: false, error: res.body.error || String(res.status) };
	} catch (err) {
		pushLog(`Teste falhou: ${String(err)}`);
		return { ok: false, error: String(err) };
	}
}

function createHubWindow() {
	if (hubWindow) {
		hubWindow.show();
		hubWindow.focus();
		void fitHubToContent();
		return;
	}
	hubWindow = new BrowserWindow({
		width: 920,
		height: 640,
		minWidth: 820,
		minHeight: 520,
		useContentSize: true,
		title: 'Teleagent',
		backgroundColor: '#0b1020',
		icon: iconPath('icon.png'),
		autoHideMenuBar: true,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});
	hubWindow.setMenuBarVisibility(false);
	hubWindow.loadFile(path.join(__dirname, '..', 'hub', 'index.html'));
	hubWindow.webContents.on('did-finish-load', () => {
		void fitHubToContent();
		if (!startHidden) hubWindow.show();
	});
	hubWindow.on('close', (e) => {
		if (!app.isQuitting) {
			e.preventDefault();
			hubWindow.hide();
		}
	});
	hubWindow.on('closed', () => {
		hubWindow = null;
	});
}

async function fitHubToContent() {
	if (!hubWindow || hubWindow.isDestroyed()) return;
	try {
		const size = await hubWindow.webContents.executeJavaScript(`(() => {
			const prev = document.body.style.overflow;
			document.body.style.overflow = 'visible';
			const width = Math.ceil(Math.max(document.body.scrollWidth, 900));
			const height = Math.ceil(Math.max(
				document.body.scrollHeight,
				document.documentElement.scrollHeight,
				document.body.getBoundingClientRect().height
			));
			document.body.style.overflow = prev || 'hidden';
			return { width, height };
		})()`);
		const display = screen.getDisplayMatching(hubWindow.getBounds());
		const maxH = Math.max(520, display.workAreaSize.height - 48);
		const width = Math.max(820, Math.min(Number(size.width) || 900, 1000));
		const height = Math.max(480, Math.min(Number(size.height) || 600, maxH));
		hubWindow.setContentSize(width, height + 2);
	} catch {
		hubWindow.setContentSize(900, 600);
	}
}

function updateTrayMenu() {
	if (!tray) return;
	const running = isBridgeRunning();
	tray.setContextMenu(
		Menu.buildFromTemplate([
			{
				label: running ? 'Bridge: online' : 'Bridge: offline',
				enabled: false,
			},
			{
				label: `Versão ${app.getVersion()}`,
				enabled: false,
			},
			{ type: 'separator' },
			{
				label: 'Abrir hub',
				click: () => createHubWindow(),
			},
			{
				label: running ? 'Parar serviço' : 'Iniciar serviço',
				click: async () => {
					if (running) await stopBridge();
					else await startBridge();
					updateTrayMenu();
				},
			},
			{
				label: 'Verificar atualizações',
				click: async () => {
					await checkForUpdates();
					createHubWindow();
				},
			},
			{ type: 'separator' },
			{
				label: 'Sair',
				click: async () => {
					app.isQuitting = true;
					await stopBridge();
					app.quit();
				},
			},
		]),
	);
	tray.setToolTip(
		running
			? `Teleagent v${app.getVersion()} — online`
			: `Teleagent v${app.getVersion()} — offline`,
	);
}

function createTray() {
	const image = nativeImage.createFromPath(iconPath('tray.png'));
	tray = new Tray(image.resize({ width: 16, height: 16 }));
	tray.on('click', () => createHubWindow());
	tray.on('double-click', () => createHubWindow());
	updateTrayMenu();
}

function wireIpc() {
	ipcMain.handle('get-status', async () => getStatus());
	ipcMain.handle('start-bridge', async () => {
		const r = await startBridge();
		updateTrayMenu();
		return r;
	});
	ipcMain.handle('stop-bridge', async () => {
		const r = await stopBridge();
		updateTrayMenu();
		return r;
	});
	ipcMain.handle('set-autostart', async (_e, enabled) =>
		applyAutostart(enabled),
	);
	ipcMain.handle('save-config', async (_e, payload) => {
		const allowed = String(payload?.allowedUserIds || '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const saved = writeConfig({
			botToken: String(payload?.botToken || '').trim(),
			chatId: String(payload?.chatId || '').trim(),
			port: Number(payload?.port) || DEFAULT_PORT,
			allowedUserIds: allowed,
		});
		pushLog('Config salva em ~/.teleagent/config.json');
		pushLog('Reinicie o serviço para aplicar token/porta.');
		return { ok: true, config: saved };
	});
	ipcMain.handle('test-alert', async () => sendTestAlert());
	ipcMain.handle('open-config', async () => {
		fs.mkdirSync(configDir(), { recursive: true });
		await shell.openPath(configDir());
		return { ok: true };
	});
	ipcMain.handle('open-external', async (_e, url) => {
		await shell.openExternal(String(url));
		return { ok: true };
	});
	ipcMain.handle('fit-window', async () => {
		await fitHubToContent();
		return { ok: true };
	});
	ipcMain.handle('check-updates', async () => checkForUpdates());
	ipcMain.handle('download-update', async () => downloadUpdate());
	ipcMain.handle('install-update', async () => {
		app.isQuitting = true;
		return installUpdateAndRestart({ beforeQuit: stopBridge });
	});
}

function broadcastStatus() {
	void getStatus().then((s) => hubWindow?.webContents.send('status', s));
}

app.whenReady().then(() => {
	Menu.setApplicationMenu(null);
	wireIpc();
	setupAutoUpdater(app, {
		pushLog,
		onState: () => {
			broadcastStatus();
			updateTrayMenu();
		},
	});
	const prefs = readDesktopPrefs();
	if (prefs.autostart) applyAutostart(true);
	createTray();
	createHubWindow();
	void startBridge();
	setInterval(() => {
		updateTrayMenu();
		broadcastStatus();
	}, 4000);
});

app.on('window-all-closed', (e) => {
	e.preventDefault();
});

app.on('before-quit', () => {
	app.isQuitting = true;
});
