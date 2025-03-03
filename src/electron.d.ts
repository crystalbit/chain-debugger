import { ElectronAPI } from '../public/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 