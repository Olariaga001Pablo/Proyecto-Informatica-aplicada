const  {app, BrowserWindow} = require('electron');
require('electron-reload')(__dirname, {
    electron: require('electron')
});

let win;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(createWindow);
