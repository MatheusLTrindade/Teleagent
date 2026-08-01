const teleagentI18n = window.TeleagentI18n;
if (!teleagentI18n?.dictionaries || !teleagentI18n?.formatMessage) {
	throw new Error(
		"TeleagentI18n failed to load (check i18n.js / script order)",
	);
}
const { dictionaries, formatMessage } = teleagentI18n;

const pill = document.getElementById("statusPill");
const factToken = document.getElementById("factToken");
const factChat = document.getElementById("factChat");
const factPending = document.getElementById("factPending");
const factAllow = document.getElementById("factAllow");
const logsEl = document.getElementById("logs");
const autostart = document.getElementById("autostart");
const autostartHint = document.getElementById("autostartHint");
const btnToggle = document.getElementById("btnToggle");
const btnTest = document.getElementById("btnTest");
const hintPort = document.getElementById("hintPort");
const cfgToken = document.getElementById("cfgToken");
const cfgChat = document.getElementById("cfgChat");
const cfgAllow = document.getElementById("cfgAllow");
const cfgPort = document.getElementById("cfgPort");
const configMsg = document.getElementById("configMsg");
const appVersion = document.getElementById("appVersion");
const updateBanner = document.getElementById("updateBanner");
const updateTitle = document.getElementById("updateTitle");
const updateDetail = document.getElementById("updateDetail");
const btnCheckUpdate = document.getElementById("btnCheckUpdate");
const btnApplyUpdate = document.getElementById("btnApplyUpdate");
const langSelect = document.getElementById("langSelect");
const btnRevealToken = document.getElementById("btnRevealToken");

let online = false;
let fillingConfig = false;
/** @type {string | null} */
let lastUpdateStatus = null;
/** @type {import('./i18n.js').Locale} */
let locale = "pt";
/** @type {any} */
let lastStatus = null;

function t(key, vars) {
	const dict = dictionaries[locale] || dictionaries.pt;
	const template = dict[key] || dictionaries.pt[key] || key;
	return vars ? formatMessage(template, vars) : template;
}

function detectLocale() {
	const saved = localStorage.getItem("teleagent.lang");
	if (saved && dictionaries[saved]) return saved;
	const nav = (navigator.language || "pt").toLowerCase();
	if (nav.startsWith("es")) return "es";
	if (nav.startsWith("en")) return "en";
	return "pt";
}

function applyStaticI18n() {
	document.documentElement.lang =
		locale === "pt" ? "pt-BR" : locale === "es" ? "es" : "en";
	document.querySelectorAll("[data-i18n]").forEach((el) => {
		const key = el.getAttribute("data-i18n");
		if (!key) return;
		el.textContent = t(key);
	});
	document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
		const key = el.getAttribute("data-i18n-placeholder");
		if (!key || !("placeholder" in el)) return;
		el.placeholder = t(key);
	});
	langSelect.value = locale;
	btnRevealToken.textContent =
		cfgToken.type === "password" ? t("btnRevealToken") : t("btnHideToken");
}

function setLocale(next) {
	if (!dictionaries[next]) return;
	locale = next;
	localStorage.setItem("teleagent.lang", locale);
	applyStaticI18n();
	if (lastStatus) applyStatus(lastStatus);
	else applyToggle();
	void window.teleagent.fitWindow();
}

function renderLogs(lines) {
	logsEl.textContent = (lines || []).join("\n");
	logsEl.scrollTop = logsEl.scrollHeight;
}

function setTab(name) {
	document.querySelectorAll(".tab").forEach((tab) => {
		tab.classList.toggle("active", tab.dataset.tab === name);
	});
	document.querySelectorAll(".panel").forEach((p) => {
		p.classList.toggle("active", p.id === `panel-${name}`);
	});
	void window.teleagent.fitWindow();
}

function applyToggle() {
	btnToggle.textContent = online ? t("btnStop") : t("btnStart");
	btnToggle.classList.toggle("danger", online);
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
		status === "checking" ||
		status === "available" ||
		status === "downloading" ||
		status === "ready" ||
		status === "error";
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
		: "";
	btnApplyUpdate.hidden = true;
	btnCheckUpdate.disabled = status === "checking" || status === "downloading";
	btnApplyUpdate.disabled = false;

	if (status === "checking") {
		updateTitle.textContent = t("updChecking");
		updateDetail.textContent = t("updCheckingDetail");
	} else if (status === "available") {
		updateTitle.textContent = t("updAvailable", { version: available });
		updateDetail.textContent = t("updAvailableDetail", { current: version });
		btnApplyUpdate.hidden = false;
		btnApplyUpdate.textContent = t("updDownload");
	} else if (status === "downloading") {
		const pct =
			update.progress !== null && update.progress !== undefined
				? ` ${update.progress}%`
				: "";
		updateTitle.textContent = t("updDownloading", { pct });
		updateDetail.textContent = available
			? t("updDownloadingDetail", { version: available })
			: t("updWait");
	} else if (status === "ready") {
		updateTitle.textContent = t("updReady", { version: available });
		updateDetail.textContent = t("updReadyDetail");
		btnApplyUpdate.hidden = false;
		btnApplyUpdate.textContent = t("updInstall");
	} else if (status === "error") {
		updateTitle.textContent = t("updError");
		updateDetail.textContent = update.error || t("updRetry");
	}

	if (status !== lastUpdateStatus) {
		lastUpdateStatus = status;
		void window.teleagent.fitWindow();
	}
}

function applyStatus(s) {
	if (!s) return;
	lastStatus = s;
	online = Boolean(s.running || s.health?.ok);
	pill.textContent = online ? t("online") : t("offline");
	pill.className = `pill ${online ? "ok" : "off"}`;
	applyToggle();
	applyUpdate(s.update, s.version);
	factToken.textContent = s.config?.hasToken ? t("tokenOk") : t("tokenMissing");
	factChat.textContent = s.config?.chatId || t("chatUnlinked");
	factPending.textContent =
		s.health?.pending !== undefined ? String(s.health.pending) : "—";
	const allow = s.config?.allowedUserIds || [];
	factAllow.textContent = allow.length ? allow.join(", ") : t("allowOpen");
	hintPort.textContent = String(s.config?.port || 3847);
	autostart.checked = Boolean(s.autostart);
	autostartHint.textContent = s.autostart ? t("autostartOn") : "";
	if (!fillingConfig) {
		cfgToken.value = s.config?.botToken || "";
		cfgChat.value = s.config?.chatId || "";
		cfgAllow.value = (s.config?.allowedUserIds || []).join(", ");
		cfgPort.value = String(s.config?.port || 3847);
	}
	if (Array.isArray(s.logs)) renderLogs(s.logs);
}

async function refresh() {
	try {
		const s = await window.teleagent.getStatus();
		applyStatus(s);
	} catch (err) {
		pill.textContent = t("offline");
		pill.className = "pill off";
		logsEl.textContent = `[hub] getStatus failed: ${String(err)}`;
	}
}

langSelect.addEventListener("change", () => setLocale(langSelect.value));

document.querySelectorAll(".tab").forEach((tab) => {
	tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

btnToggle.addEventListener("click", async () => {
	btnToggle.disabled = true;
	try {
		if (online) await window.teleagent.stopBridge();
		else await window.teleagent.startBridge();
		await refresh();
	} finally {
		btnToggle.disabled = false;
	}
});

btnTest.addEventListener("click", async () => {
	btnTest.disabled = true;
	try {
		await window.teleagent.testAlert();
		await refresh();
	} finally {
		btnTest.disabled = false;
	}
});

btnCheckUpdate.addEventListener("click", async () => {
	btnCheckUpdate.disabled = true;
	try {
		await window.teleagent.checkUpdates();
		await refresh();
	} finally {
		btnCheckUpdate.disabled = false;
	}
});

btnApplyUpdate.addEventListener("click", async () => {
	btnApplyUpdate.disabled = true;
	try {
		const s = await window.teleagent.getStatus();
		const status = s?.update?.status;
		if (status === "available") {
			await window.teleagent.downloadUpdate();
		} else if (status === "ready") {
			await window.teleagent.installUpdate();
		}
		await refresh();
	} finally {
		btnApplyUpdate.disabled = false;
	}
});

autostart.addEventListener("change", async () => {
	const r = await window.teleagent.setAutostart(autostart.checked);
	autostart.checked = Boolean(r?.autostart);
	autostartHint.textContent = autostart.checked
		? t("autostartEnabled")
		: t("autostartOff");
	await refresh();
});

document.getElementById("btnBot").addEventListener("click", () => {
	void window.teleagent.openExternal("https://t.me/teleagent_bridge_bot");
});

document.getElementById("btnGoConfig").addEventListener("click", () => {
	setTab("config");
});

document.getElementById("btnOpenFolder").addEventListener("click", () => {
	void window.teleagent.openConfig();
});

btnRevealToken.addEventListener("click", () => {
	cfgToken.type = cfgToken.type === "password" ? "text" : "password";
	btnRevealToken.textContent =
		cfgToken.type === "password" ? t("btnRevealToken") : t("btnHideToken");
});

document.getElementById("configForm").addEventListener("submit", async (e) => {
	e.preventDefault();
	fillingConfig = true;
	configMsg.textContent = t("saving");
	try {
		await window.teleagent.saveConfig({
			botToken: cfgToken.value,
			chatId: cfgChat.value,
			allowedUserIds: cfgAllow.value,
			port: cfgPort.value,
		});
		configMsg.textContent = t("saved");
		await refresh();
	} catch (err) {
		configMsg.textContent = String(err);
	} finally {
		fillingConfig = false;
	}
});

document.getElementById("btnDocsBot").addEventListener("click", () => {
	void window.teleagent.openExternal("https://t.me/teleagent_bridge_bot");
});

document.getElementById("btnDocsFather").addEventListener("click", () => {
	void window.teleagent.openExternal("https://t.me/BotFather");
});

document.querySelectorAll("[data-external]").forEach((a) => {
	a.addEventListener("click", (e) => {
		e.preventDefault();
		void window.teleagent.openExternal(a.getAttribute("href"));
	});
});

window.teleagent.onStatus((s) => {
	if (s) applyStatus(s);
	else void refresh();
});

window.teleagent.onLog((line) => {
	const current = logsEl.textContent ? logsEl.textContent.split("\n") : [];
	current.push(line);
	renderLogs(current.slice(-80));
});

locale = detectLocale();
applyStaticI18n();
void refresh();
setInterval(() => void refresh(), 5000);
