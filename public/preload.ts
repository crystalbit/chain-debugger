import { contextBridge, ipcRenderer } from 'electron';
import { TestCase } from '../src/types';

interface JsonFile {
  name: string;
  path: string;
  stepCount: number | 'error';
}

interface SimulationProgress {
  currentStep: number;
  totalSteps: number;
  testCase: TestCase;
}

const electronAPI = {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getLastDirectory: () => ipcRenderer.invoke('get-last-directory'),
  listJsonFiles: (dirPath: string): Promise<JsonFile[]> => ipcRenderer.invoke('list-json-files', dirPath),
  readFile: (filePath: string): Promise<string> => ipcRenderer.invoke('read-file', filePath),
  simulateTestCase: (filePath: string): Promise<{ success: boolean; error?: string }> => 
    ipcRenderer.invoke('simulate-test-case', filePath),
  onStepComplete: (callback: (event: any, data: any) => void) => 
    ipcRenderer.on('step-complete', callback),
  removeStepCompleteListener: (callback: (event: any, data: any) => void) => 
    ipcRenderer.removeListener('step-complete', callback),
} as const;

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI; 