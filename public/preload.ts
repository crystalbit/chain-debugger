import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getLastDirectory: () => ipcRenderer.invoke('get-last-directory')
});

// TypeScript interface for the exposed API
export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  getLastDirectory: () => Promise<string | null>;
} 