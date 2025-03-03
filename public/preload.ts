import { contextBridge, ipcRenderer } from 'electron';

interface JsonFile {
  name: string;
  path: string;
  stepCount: number | 'error';
}

const electronAPI = {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getLastDirectory: () => ipcRenderer.invoke('get-last-directory'),
  listJsonFiles: (dirPath: string): Promise<JsonFile[]> => ipcRenderer.invoke('list-json-files', dirPath),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI; 