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

let online = false;
let fillingConfig = false;

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

function applyStatus(s) {
	if (!s) return;
	online = Boolean(s.running || s.health?.ok);
	pill.textContent = online ? 'online' : 'offline';
	pill.className = `pill ${online ? 'ok' : 'off'}`;
	applyToggle();
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
