const { app, BrowserWindow, ipcMain } = require('electron');
const electronReload = require('electron-reload');
const path = require('path');

electronReload(__dirname);

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
    win.loadURL(`file://${__dirname}/../lib/index.html`);

    win.on('closed', () => {
        win = null;
    });
}

// Manejar la comunicación IPC para cargar páginas
ipcMain.handle('load-page', async (event, pageName) => {
    if (win) {
        const pagePath = path.join(__dirname, '../lib', pageName);
        win.loadFile(pagePath);
    }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
