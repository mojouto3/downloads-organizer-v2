const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  preview:      (folder) => ipcRenderer.invoke('preview', folder),
  organize:     (folder) => ipcRenderer.invoke('organize', folder),
  undo:         (moves)  => ipcRenderer.invoke('undo', moves),
  pickFolder:   ()       => ipcRenderer.invoke('pick-folder'),
  openLog:      ()       => ipcRenderer.invoke('open-log'),
  schedule:     (folder) => ipcRenderer.invoke('schedule', folder),
  unschedule:   ()       => ipcRenderer.invoke('unschedule'),
  minimize:     ()       => ipcRenderer.send('minimize'),
  close:        ()       => ipcRenderer.send('close'),
  getDownloads: () => ipcRenderer.invoke('get-downloads'),
});
