/**
 * Regression: classic scripts share one global lexical scope.
 * Loading i18n.js + app.js in the same realm must not throw SyntaxError.
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const hubDir = path.join(__dirname, "..", "hub");
const i18n = fs.readFileSync(path.join(hubDir, "i18n.js"), "utf8");
const appSrc = fs.readFileSync(path.join(hubDir, "app.js"), "utf8");
const html = fs.readFileSync(path.join(hubDir, "index.html"), "utf8");

function el(tag, attrs = {}) {
	const o = {
		tagName: String(tag).toUpperCase(),
		attrs: { ...attrs },
		style: {},
		className: "",
		hidden: false,
		disabled: false,
		checked: false,
		type: attrs.type || "text",
		value: attrs.value || "",
		dataset: attrs["data-tab"] ? { tab: attrs["data-tab"] } : {},
		_text: "",
		scrollTop: 0,
		scrollHeight: 0,
		classList: { toggle() {} },
		addEventListener() {},
		getAttribute(k) {
			return this.attrs[k] ?? null;
		},
		setAttribute(k, v) {
			this.attrs[k] = v;
		},
	};
	Object.defineProperty(o, "textContent", {
		get() {
			return this._text;
		},
		set(v) {
			this._text = String(v);
		},
	});
	Object.defineProperty(o, "placeholder", {
		get() {
			return this.attrs.placeholder || "";
		},
		set(v) {
			this.attrs.placeholder = v;
		},
	});
	return o;
}

const byId = {};
const all = [];
for (const m of html.matchAll(/<([a-z0-9]+)([^>]*)>/gi)) {
	const tag = m[1];
	const raw = m[2];
	const attrs = {};
	for (const a of raw.matchAll(/([:@\w-]+)(?:="([^"]*)"|='([^']*)')?/g)) {
		attrs[a[1]] = a[2] ?? a[3] ?? "";
	}
	const node = el(tag, attrs);
	all.push(node);
	if (attrs.id) byId[attrs.id] = node;
}

const calls = [];
let resolveStatus;
const statusPromise = new Promise((r) => {
	resolveStatus = r;
});

const teleagent = {
	async getStatus() {
		calls.push("getStatus");
		return statusPromise;
	},
	async fitWindow() {
		calls.push("fitWindow");
		return { ok: true };
	},
	onStatus() {
		calls.push("onStatus");
	},
	onLog() {
		calls.push("onLog");
	},
	async startBridge() {
		return {};
	},
	async stopBridge() {
		return {};
	},
	async setAutostart() {
		return { autostart: false };
	},
	async saveConfig() {
		return {};
	},
	async testAlert() {
		return {};
	},
	async openConfig() {
		return {};
	},
	async openExternal() {
		return {};
	},
	async checkUpdates() {
		return {};
	},
	async downloadUpdate() {
		return {};
	},
	async installUpdate() {
		return {};
	},
};

const documentRef = {
	documentElement: { lang: "pt-BR" },
	getElementById: (id) => byId[id] || null,
	querySelectorAll: (sel) => {
		if (sel === "[data-i18n]") {
			return all.filter((e) => e.getAttribute("data-i18n"));
		}
		if (sel === "[data-i18n-placeholder]") {
			return all.filter((e) => e.getAttribute("data-i18n-placeholder"));
		}
		return [];
	},
};

const ctx = {
	console,
	setInterval: () => 0,
	localStorage: {
		s: {},
		getItem(k) {
			return this.s[k] || null;
		},
		setItem(k, v) {
			this.s[k] = String(v);
		},
	},
	navigator: { language: "pt-BR" },
	document: documentRef,
	window: { teleagent },
};

vm.createContext(ctx);

try {
	vm.runInContext(`${i18n}\n${appSrc}`, ctx);
} catch (err) {
	console.error("hub boot failed:", err);
	process.exit(1);
}

if (!calls.includes("getStatus")) {
	console.error("refresh() did not call getStatus");
	process.exit(1);
}

resolveStatus({
	running: true,
	health: { ok: true, pending: 0 },
	version: "1.1.1",
	update: { status: "idle" },
	config: {
		hasToken: true,
		botToken: "x",
		chatId: "1",
		port: 3847,
		allowedUserIds: ["1"],
	},
	autostart: true,
	logs: ["hello"],
});

setTimeout(() => {
	const pill = byId.statusPill?.textContent;
	const ver = byId.appVersion?.textContent;
	const token = byId.factToken?.textContent;
	const logs = byId.logs?.textContent;
	if (
		pill !== "online" ||
		ver !== "v1.1.1" ||
		token !== "configurado" ||
		logs !== "hello"
	) {
		console.error("status apply failed", { pill, ver, token, logs, calls });
		process.exit(1);
	}
	console.log("hub boot ok", { pill, ver, token, calls });
}, 30);
