const  {app, BrowserWindow} = require('electron');
const electronReload = require('electron-reload');


electronReload(__dirname);

app.on('ready', () => {
    
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: true
    }
    });

    win.loadURL(`file://${__dirname}/../lib/index.html`);

    win.on('closed', () => {
        win = null;
    });
   

});
