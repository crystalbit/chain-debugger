const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
import * as path from 'path';
import * as fs from 'fs';

const isDev = process.env.NODE_ENV !== 'production';
let mainWindow: typeof BrowserWindow | null = null;

// Simple storage implementation
const storagePath = path.join(app.getPath('userData'), 'storage.json');
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

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register protocol handler for local files
app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request: any, callback: any) => {
    const filePath = decodeURIComponent(request.url.replace('file://', ''));
    try {
      return callback(filePath);
    } catch (error) {
      console.error('Error handling file protocol:', error);
      return callback({ error: -2 });
    }
  });
});

// IPC handlers
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

// List JSON files in directory
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

// App lifecycle
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 