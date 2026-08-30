//this section of the code is for electron to create the app window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const backend = require('./backend.js');
const path = require('node:path')

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'P2P Connect',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  win.maximize()

  //during development, using npm run dev will open the site on localhost, which we will load here
  //in final build, switch to loadFile
  win.loadURL('http://localhost:5173');
  //win.loadFile('index.html') 
}
app.whenReady().then(() => {
  createWindow()
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

//recieve messages
ipcMain.on('tryConnect', (arg1, arg2, arg3, arg4) => {
    backend.tryConnect(arg1, arg2, arg3, arg4, win);
});

