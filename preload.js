const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  preview:        (folder) => ipcRenderer.invoke('preview', folder),
  organize:       (folder) => ipcRenderer.invoke('organize', folder),
  undo:           (moves)  => ipcRenderer.invoke('undo', moves),
  pickFolder:     ()       => ipcRenderer.invoke('pick-folder'),
  getDownloads:   ()       => ipcRenderer.invoke('get-downloads'),
  getLog:         ()       => ipcRenderer.invoke('get-log'),
  clearLog:       ()       => ipcRenderer.invoke('clear-log'),
  deleteSession:  (id)     => ipcRenderer.invoke('delete-session', id),
  schedule:       (folder) => ipcRenderer.invoke('schedule', folder),
  unschedule:     ()       => ipcRenderer.invoke('unschedule'),
  getGroups:      ()       => ipcRenderer.invoke('get-groups'),
  saveGroups:     (g)      => ipcRenderer.invoke('save-groups', g),
  previewGroups:  (folder) => ipcRenderer.invoke('preview-groups', folder),
  organizeGroups: (folder) => ipcRenderer.invoke('organize-groups', folder),
  minimize:       ()       => ipcRenderer.send('minimize'),
  close:          ()       => ipcRenderer.send('close'),
});
