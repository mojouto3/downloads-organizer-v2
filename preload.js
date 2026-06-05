const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  preview:       (folder) => ipcRenderer.invoke('preview', folder),
  organize:      (folder) => ipcRenderer.invoke('organize', folder),
  undo:          (moves)  => ipcRenderer.invoke('undo', moves),
  pickFolder:    ()       => ipcRenderer.invoke('pick-folder'),
  getDownloads:  ()       => ipcRenderer.invoke('get-downloads'),
  getLog:        ()       => ipcRenderer.invoke('get-log'),
  clearLog:      ()       => ipcRenderer.invoke('clear-log'),
  deleteSession: (id)     => ipcRenderer.invoke('delete-session', id),
  schedule:      (folder) => ipcRenderer.invoke('schedule', folder),
  unschedule:    ()       => ipcRenderer.invoke('unschedule'),
  minimize:      ()       => ipcRenderer.send('minimize'),
  close:         ()       => ipcRenderer.send('close'),
});
