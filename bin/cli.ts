#!/usr/bin/env node

import { spawn } from 'child_process';
import * as path from 'path';

async function startApp() {
  try {
    // Try to require electron
    let electronPath;
    try {
      electronPath = require('electron');
    } catch (err) {
      console.log('Electron not found, skipping...');
      process.exit(0);
    }

    const projectRoot = path.resolve(__dirname, '..');
    const electronJsPath = path.join(projectRoot, 'build', 'electron.js');
    const indexHtmlPath = path.join(projectRoot, 'build', 'index.html');

    console.log('Starting application...');
    console.log('Project root:', projectRoot);
    console.log('Electron path:', electronPath);
    console.log('Electron.js path:', electronJsPath);
    console.log('Index.html path:', indexHtmlPath);

    const electronProcess = spawn(electronPath, [electronJsPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        ELECTRON_START_URL: `file://${indexHtmlPath}`,
        NODE_ENV: 'production'
      }
    });

    electronProcess.on('error', (err) => {
      console.error('Failed to start electron process:', err);
      process.exit(1);
    });

    electronProcess.on('exit', (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

startApp(); 