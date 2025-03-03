import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

// Set isDev explicitly based on NODE_ENV
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Use the environment variable for the start URL, falling back to localhost in dev
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';

  console.log('Loading URL:', startUrl);
  console.log('isDev:', isDev);
  console.log('App path:', app.getAppPath());

  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Quit the app when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
}

app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 