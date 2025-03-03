import { contextBridge, ipcRenderer } from 'electron';

interface JsonFile {
  name: string;
  path: string;
  size: number;
}

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getLastDirectory: () => ipcRenderer.invoke('get-last-directory'),
  listJsonFiles: (dirPath: string) => ipcRenderer.invoke('list-json-files', dirPath)
});

// TypeScript interface for the exposed API
export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  getLastDirectory: () => Promise<string | null>;
  listJsonFiles: (dirPath: string) => Promise<JsonFile[]>;
} 