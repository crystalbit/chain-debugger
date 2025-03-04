import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { terminateAnvil } from '../src/blockchain/fork-work';
import { simulateTestCase } from '../src/blockchain/simulation';
import { hang } from 'process';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

// Simple storage implementation
const storagePath = path.normalize(path.join(app.getPath('userData'), 'storage.json'));
const storage = {
  get: (key: string) => {
    try {
      if (!fs.existsSync(storagePath)) return null;
      const data = JSON.parse(fs.readFileSync(storagePath, 'utf-8'));
      return data[key];
    } catch (error) {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      const data = fs.existsSync(storagePath) 
        ? JSON.parse(fs.readFileSync(storagePath, 'utf-8')) 
        : {};
      data[key] = value;
      fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.normalize(path.join(__dirname, 'preload.js'))
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`file://${path.normalize(path.join(__dirname, '../../build/index.html'))}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerHandlers() {
  // Register protocol handler for local files
  protocol.registerFileProtocol('file', (request: any, callback: any) => {
    const filePath = decodeURIComponent(request.url.replace('file://', ''));
    try {
      return callback(filePath);
    } catch (error) {
      console.error('Error handling file protocol:', error);
      return callback({ error: -2 });
    }
  });

  // Register IPC handlers
  ipcMain.handle('simulate-test-case', async (event, filePath) => {
    try {
      await simulateTestCase(
        filePath,
        (stepIndex: number, status: 'success' | 'failed') => {
          // Read the current state of the file to get the updated step
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const step = content.steps[stepIndex];
          
          // Emit step completion event
          event.sender.send('step-complete', { 
            index: stepIndex, 
            status, 
            step 
          });
        }
      );
      return { success: true };
    } catch (error) {
      console.error('Error simulating test case:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });

  ipcMain.handle('select-directory', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    const selectedPath = result.canceled ? null : result.filePaths[0];
    if (selectedPath) {
      storage.set('lastSelectedDirectory', selectedPath);
    }
    return selectedPath;
  });

  ipcMain.handle('get-last-directory', () => {
    return storage.get('lastSelectedDirectory');
  });

  ipcMain.handle('list-json-files', async (_: any, dirPath: string) => {
    try {
      const files = fs.readdirSync(dirPath);
      return files
        .filter(file => file.toLowerCase().endsWith('.json'))
        .map(file => {
          const filePath = path.join(dirPath, file);
          try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const steps = content.steps;
            const stepCount = Array.isArray(steps) ? steps.length : 'error';
            return {
              name: file,
              path: filePath,
              stepCount
            };
          } catch (error) {
            return {
              name: file,
              path: filePath,
              stepCount: 'error'
            };
          }
        });
    } catch (error) {
      console.error('Error listing JSON files:', error);
      return [];
    }
  });

  ipcMain.handle('read-test-case', async (_: any, filePath: string) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading test case:', error);
      throw error;
    }
  });

  ipcMain.handle('read-file', async (_: any, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  });
}

// App lifecycle
app.whenReady().then(() => {
  registerHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  terminateAnvil(); // Ensure Anvil is terminated when app closes
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 