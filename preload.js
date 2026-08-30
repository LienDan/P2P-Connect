//preload script is a script that gets loaded first, and acts as a bridge between frontend and backend (main)
const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('electronAPI', {
  //frontend -> backend
  tryConnect: (arg1, arg2, arg3, arg4) => {
    ipcRenderer.send('tryConnect', arg1, arg2, arg3, arg4);
  },

  //backend -> frontend
  connectResult: (callback) => {
    ipcRenderer.on('connectResult', (_event, result) => callback(result))
  }

  //note to self, front->back and back->front have slightly diff syntax for communication.
});