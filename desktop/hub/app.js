const pill = document.getElementById('statusPill');
const factToken = document.getElementById('factToken');
const factChat = document.getElementById('factChat');
const factPending = document.getElementById('factPending');
const factAllow = document.getElementById('factAllow');
const logsEl = document.getElementById('logs');
const autostart = document.getElementById('autostart');
const autostartHint = document.getElementById('autostartHint');
const btnToggle = document.getElementById('btnToggle');
const btnTest = document.getElementById('btnTest');
const hintPort = document.getElementById('hintPort');
const cfgToken = document.getElementById('cfgToken');
const cfgChat = document.getElementById('cfgChat');
const cfgAllow = document.getElementById('cfgAllow');
const cfgPort = document.getElementById('cfgPort');
const configMsg = document.getElementById('configMsg');
const appVersion = document.getElementById('appVersion');
const updateBanner = document.getElementById('updateBanner');
const updateTitle = document.getElementById('updateTitle');
const updateDetail = document.getElementById('updateDetail');
const btnCheckUpdate = document.getElementById('btnCheckUpdate');
const btnApplyUpdate = document.getElementById('btnApplyUpdate');

let online = false;
let fillingConfig = false;
/** @type {string | null} */
let lastUpdateStatus = null;

function renderLogs(lines) {
	logsEl.textContent = (lines || []).join('\n');
	logsEl.scrollTop = logsEl.scrollHeight;
}

function setTab(name) {
	document.querySelectorAll('.tab').forEach((t) => {
		t.classList.toggle('active', t.dataset.tab === name);
	});
	document.querySelectorAll('.panel').forEach((p) => {
		p.classList.toggle('active', p.id === `panel-${name}`);
	});
	void window.teleagent.fitWindow();
}

function applyToggle() {
	btnToggle.textContent = online ? 'Parar' : 'Iniciar';
	btnToggle.classList.toggle('danger', online);
}

function applyUpdate(update, version) {
	if (version) {
		appVersion.textContent = `v${version}`;
	}
	if (!update) {
		updateBanner.hidden = true;
		return;
	}

	const status = update.status;
	const show =
		status === 'checking' ||
		status === 'available' ||
		status === 'downloading' ||
		status === 'ready' ||
		status === 'error';
	updateBanner.hidden = !show;
	if (!show) {
		if (status !== lastUpdateStatus) {
			lastUpdateStatus = status;
			void window.teleagent.fitWindow();
		}
		return;
	}

	const available = update.availableVersion
		? `v${update.availableVersion}`
		: '';
	btnApplyUpdate.hidden = true;
	btnCheckUpdate.disabled = status === 'checking' || status === 'downloading';
	btnApplyUpdate.disabled = false;

	if (status === 'checking') {
		updateTitle.textContent = 'Verificando…';
		updateDetail.textContent = 'Consultando GitHub Releases.';
	} else if (status === 'available') {
		updateTitle.textContent = `Nova versão ${available}`;
		updateDetail.textContent = `Você está em v${version}.`;
		btnApplyUpdate.hidden = false;
		btnApplyUpdate.textContent = 'Baixar atualização';
	} else if (status === 'downloading') {
		const pct =
			update.progress !== null && update.progress !== undefined
				? ` ${update.progress}%`
				: '';
		updateTitle.textContent = `Baixando${pct}`;
		updateDetail.textContent = available ? `Versão ${available}` : 'Aguarde…';
	} else if (status === 'ready') {
		updateTitle.textContent = `Pronto para instalar ${available}`;
		updateDetail.textContent = 'O app vai reiniciar para aplicar.';
		btnApplyUpdate.hidden = false;
		btnApplyUpdate.textContent = 'Instalar e reiniciar';
	} else if (status === 'error') {
		updateTitle.textContent = 'Falha ao atualizar';
		updateDetail.textContent = update.error || 'Tente novamente.';
	}

	if (status !== lastUpdateStatus) {
		lastUpdateStatus = status;
		void window.teleagent.fitWindow();
	}
}

function applyStatus(s) {
	if (!s) return;
	online = Boolean(s.running || s.health?.ok);
	pill.textContent = online ? 'online' : 'offline';
	pill.className = `pill ${online ? 'ok' : 'off'}`;
	applyToggle();
	applyUpdate(s.update, s.version);
	factToken.textContent = s.config?.hasToken ? 'configurado' : 'ausente';
	factChat.textContent = s.config?.chatId || 'não vinculado';
	factPending.textContent =
		s.health?.pending !== undefined ? String(s.health.pending) : '—';
	const allow = s.config?.allowedUserIds || [];
	factAllow.textContent = allow.length ? allow.join(', ') : 'aberta';
	hintPort.textContent = String(s.config?.port || 3847);
	autostart.checked = Boolean(s.autostart);
	autostartHint.textContent = s.autostart
		? 'O app tentará abrir oculto ao ligar o Windows.'
		: '';
	if (!fillingConfig) {
		cfgToken.value = s.config?.botToken || '';
		cfgChat.value = s.config?.chatId || '';
		cfgAllow.value = (s.config?.allowedUserIds || []).join(', ');
		cfgPort.value = String(s.config?.port || 3847);
	}
	if (Array.isArray(s.logs)) renderLogs(s.logs);
}

async function refresh() {
	const s = await window.teleagent.getStatus();
	applyStatus(s);
}

document.querySelectorAll('.tab').forEach((tab) => {
	tab.addEventListener('click', () => setTab(tab.dataset.tab));
});

btnToggle.addEventListener('click', async () => {
	btnToggle.disabled = true;
	try {
		if (online) await window.teleagent.stopBridge();
		else await window.teleagent.startBridge();
		await refresh();
	} finally {
		btnToggle.disabled = false;
	}
});

btnTest.addEventListener('click', async () => {
	btnTest.disabled = true;
	try {
		const r = await window.teleagent.testAlert();
		if (!r?.ok) {
			configMsg.textContent = '';
		}
		await refresh();
	} finally {
		btnTest.disabled = false;
	}
});

btnCheckUpdate.addEventListener('click', async () => {
	btnCheckUpdate.disabled = true;
	try {
		await window.teleagent.checkUpdates();
		await refresh();
	} finally {
		btnCheckUpdate.disabled = false;
	}
});

btnApplyUpdate.addEventListener('click', async () => {
	btnApplyUpdate.disabled = true;
	try {
		const s = await window.teleagent.getStatus();
		const status = s?.update?.status;
		if (status === 'available') {
			await window.teleagent.downloadUpdate();
		} else if (status === 'ready') {
			await window.teleagent.installUpdate();
		}
		await refresh();
	} finally {
		btnApplyUpdate.disabled = false;
	}
});

autostart.addEventListener('change', async () => {
	const r = await window.teleagent.setAutostart(autostart.checked);
	autostart.checked = Boolean(r?.autostart);
	autostartHint.textContent = autostart.checked
		? 'Ativado. Se não abrir sozinho, confira Inicializar apps no Windows.'
		: 'Desativado.';
	await refresh();
});

document.getElementById('btnBot').addEventListener('click', () => {
	void window.teleagent.openExternal('https://t.me/teleagent_bridge_bot');
});

document.getElementById('btnGoConfig').addEventListener('click', () => {
	setTab('config');
});

document.getElementById('btnOpenFolder').addEventListener('click', () => {
	void window.teleagent.openConfig();
});

document.getElementById('btnRevealToken').addEventListener('click', () => {
	cfgToken.type = cfgToken.type === 'password' ? 'text' : 'password';
});

document.getElementById('configForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	fillingConfig = true;
	configMsg.textContent = 'Salvando…';
	try {
		await window.teleagent.saveConfig({
			botToken: cfgToken.value,
			chatId: cfgChat.value,
			allowedUserIds: cfgAllow.value,
			port: cfgPort.value,
		});
		configMsg.textContent =
			'Salvo. Reinicie o serviço na aba Início para aplicar.';
		await refresh();
	} catch (err) {
		configMsg.textContent = String(err);
	} finally {
		fillingConfig = false;
	}
});

document.getElementById('btnDocsBot').addEventListener('click', () => {
	void window.teleagent.openExternal('https://t.me/teleagent_bridge_bot');
});

document.getElementById('btnDocsFather').addEventListener('click', () => {
	void window.teleagent.openExternal('https://t.me/BotFather');
});

document.querySelectorAll('[data-external]').forEach((a) => {
	a.addEventListener('click', (e) => {
		e.preventDefault();
		void window.teleagent.openExternal(a.getAttribute('href'));
	});
});

window.teleagent.onStatus((s) => {
	if (s) applyStatus(s);
	else void refresh();
});

window.teleagent.onLog((line) => {
	const current = logsEl.textContent ? logsEl.textContent.split('\n') : [];
	current.push(line);
	renderLogs(current.slice(-80));
});

void refresh();
setInterval(() => void refresh(), 5000);
