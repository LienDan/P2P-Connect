//preload script is a script that gets loaded first, and acts as a bridge between frontend and backend (main)
const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
  //frontend -> backend
  tryConnect: (message) => {
    ipcRenderer.send('tryConnect', message);
  },

  //backend -> frontend
  connectResult: (callback) => {
    ipcRenderer.on('connectResult', (_event, result) => callback(result))
  }


});