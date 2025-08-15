const  {app, BrowserWindow} = require('electron');
const { default: electronReload } = require('electron-reload');

let win;

app.on('ready', () => {
    const electronReload = require("electron-reload");
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('lib/index.html');

  win.on('closed', () => {
    win = null;
  });

});
