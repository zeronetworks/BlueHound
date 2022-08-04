const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openDevTools: async () => ipcRenderer.invoke('open-dev-tools'),
    getConsoleMessages: async () => ipcRenderer.invoke('get-console-messages'),
    browseFile: async (index) => ipcRenderer.invoke('browse-file', index),
    browseFolder: async (index) => ipcRenderer.invoke('browse-folder', index),
    runTool: async (toolId, path, args) => ipcRenderer.invoke('run-tool', toolId, path, args),
    runToolsInSerial: async (toolsData) => ipcRenderer.invoke('run-tools-serial', toolsData),
    runPython: async (toolId, path, args) => ipcRenderer.invoke('run-python', toolId, path, args),
    uploadSharpHoundResults: async (toolId, path, connectionProperties, clearResults) => ipcRenderer.invoke('upload-sharphound-results', toolId, path, connectionProperties, clearResults),
    killProcess: async (toolId) => ipcRenderer.invoke('kill-process', toolId),
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
});
