const { autoUpdater } = require('electron-updater');

/**
 * @typedef {'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'up-to-date' | 'error' | 'unsupported'} UpdateStatus
 */

/** @type {{
 *   status: UpdateStatus,
 *   currentVersion: string,
 *   availableVersion: string | null,
 *   progress: number | null,
 *   error: string | null,
 *   supported: boolean,
 * }} */
let state = {
	status: 'idle',
	currentVersion: '',
	availableVersion: null,
	progress: null,
	error: null,
	supported: false,
};

/** @type {((s: typeof state) => void) | null} */
let onChange = null;

function emit() {
	onChange?.(getUpdateState());
}

function getUpdateState() {
	return { ...state };
}

/**
 * @param {import('electron').App} app
 * @param {{ pushLog: (line: string) => void, onState?: (s: ReturnType<typeof getUpdateState>) => void }} opts
 */
function setupAutoUpdater(app, opts) {
	state.currentVersion = app.getVersion();
	onChange = opts.onState || null;

	if (!app.isPackaged) {
		state.status = 'unsupported';
		state.supported = false;
		emit();
		return;
	}

	state.supported = true;
	autoUpdater.autoDownload = false;
	autoUpdater.autoInstallOnAppQuit = true;

	autoUpdater.on('checking-for-update', () => {
		state = {
			...state,
			status: 'checking',
			error: null,
			progress: null,
		};
		opts.pushLog('Verificando atualizações…');
		emit();
	});

	autoUpdater.on('update-available', (info) => {
		state = {
			...state,
			status: 'available',
			availableVersion: info.version,
			error: null,
		};
		opts.pushLog(`Nova versão disponível: v${info.version}`);
		emit();
	});

	autoUpdater.on('update-not-available', () => {
		state = {
			...state,
			status: 'up-to-date',
			availableVersion: null,
			error: null,
		};
		opts.pushLog('Teleagent está atualizado.');
		emit();
	});

	autoUpdater.on('download-progress', (p) => {
		state = {
			...state,
			status: 'downloading',
			progress: Math.round(p.percent),
		};
		emit();
	});

	autoUpdater.on('update-downloaded', (info) => {
		state = {
			...state,
			status: 'ready',
			availableVersion: info.version,
			progress: 100,
			error: null,
		};
		opts.pushLog(`Update v${info.version} baixado. Reinicie para aplicar.`);
		emit();
	});

	autoUpdater.on('error', (err) => {
		state = {
			...state,
			status: 'error',
			error: String(err?.message || err),
			progress: null,
		};
		opts.pushLog(`Falha no update: ${state.error}`);
		emit();
	});

	// Checagem inicial + periódica (6h)
	setTimeout(() => {
		void checkForUpdates();
	}, 4000);
	setInterval(
		() => {
			void checkForUpdates();
		},
		6 * 60 * 60 * 1000,
	);
}

async function checkForUpdates() {
	if (!state.supported) {
		return getUpdateState();
	}
	try {
		await autoUpdater.checkForUpdates();
	} catch (err) {
		state = {
			...state,
			status: 'error',
			error: String(err?.message || err),
		};
		emit();
	}
	return getUpdateState();
}

async function downloadUpdate() {
	if (!state.supported || state.status !== 'available') {
		return getUpdateState();
	}
	try {
		state = { ...state, status: 'downloading', progress: 0, error: null };
		emit();
		await autoUpdater.downloadUpdate();
	} catch (err) {
		state = {
			...state,
			status: 'error',
			error: String(err?.message || err),
			progress: null,
		};
		emit();
	}
	return getUpdateState();
}

/**
 * @param {{ beforeQuit?: () => Promise<void> }} [opts]
 */
async function installUpdateAndRestart(opts) {
	if (!state.supported || state.status !== 'ready') {
		return { ok: false, error: 'update_not_ready' };
	}
	try {
		await opts?.beforeQuit?.();
	} catch {
		/* ignore */
	}
	// true = force quit even with unsaved state / tray keep-alive
	autoUpdater.quitAndInstall(false, true);
	return { ok: true };
}

module.exports = {
	setupAutoUpdater,
	getUpdateState,
	checkForUpdates,
	downloadUpdate,
	installUpdateAndRestart,
};
