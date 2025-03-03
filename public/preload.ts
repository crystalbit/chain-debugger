const { contextBridge, ipcRenderer } = require('electron');

interface JsonFile {
  name: string;
  path: string;
  stepCount: number | 'error';
}

const electronAPI = {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getLastDirectory: () => ipcRenderer.invoke('get-last-directory'),
  listJsonFiles: (dirPath: string): Promise<JsonFile[]> => ipcRenderer.invoke('list-json-files', dirPath),
  readFile: (filePath: string): Promise<string> => ipcRenderer.invoke('read-file', filePath)
} as const;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI; 