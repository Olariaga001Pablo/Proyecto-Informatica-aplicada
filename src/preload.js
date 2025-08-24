const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al contexto de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
    loadPage: (pageName) => ipcRenderer.invoke('load-page', pageName)
});
