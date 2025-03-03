import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory')
});

// TypeScript interface for the exposed API
export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
} 