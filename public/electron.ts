import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const isDev = process.env.NODE_ENV !== 'production';
let mainWindow: BrowserWindow | null = null;

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
ipcMain.handle('list-json-files', async (_, dirPath: string) => {
  try {
    const files = fs.readdirSync(dirPath);
    return files
      .filter(file => file.toLowerCase().endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(dirPath, file),
        size: fs.statSync(path.join(dirPath, file)).size
      }));
  } catch (error) {
    console.error('Error listing JSON files:', error);
    return [];
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