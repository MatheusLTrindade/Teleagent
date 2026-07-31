const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('teleagent', {
	getStatus: () => ipcRenderer.invoke('get-status'),
	startBridge: () => ipcRenderer.invoke('start-bridge'),
	stopBridge: () => ipcRenderer.invoke('stop-bridge'),
	setAutostart: (enabled) => ipcRenderer.invoke('set-autostart', enabled),
	saveConfig: (payload) => ipcRenderer.invoke('save-config', payload),
	testAlert: () => ipcRenderer.invoke('test-alert'),
	openConfig: () => ipcRenderer.invoke('open-config'),
	openExternal: (url) => ipcRenderer.invoke('open-external', url),
	fitWindow: () => ipcRenderer.invoke('fit-window'),
	checkUpdates: () => ipcRenderer.invoke('check-updates'),
	downloadUpdate: () => ipcRenderer.invoke('download-update'),
	installUpdate: () => ipcRenderer.invoke('install-update'),
	onStatus: (cb) => {
		const handler = (_e, data) => cb(data);
		ipcRenderer.on('status', handler);
		return () => ipcRenderer.removeListener('status', handler);
	},
	onLog: (cb) => {
		const handler = (_e, line) => cb(line);
		ipcRenderer.on('logs', handler);
		return () => ipcRenderer.removeListener('logs', handler);
	},
});
