#!/usr/bin/env node

import { spawn } from 'child_process';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const electronJsPath = path.join(projectRoot, 'build', 'electron.js');
const indexHtmlPath = path.join(projectRoot, 'build', 'index.html');

// Try to find electron in various locations
function findElectron(): string | null {
  const paths = [
    // Try local installation first
    path.join(projectRoot, 'node_modules', '.bin', 'electron'),
    // Then try global installation
    '/usr/local/bin/electron',
    // Add more paths as needed
  ];

  for (const electronPath of paths) {
    try {
      require('fs').accessSync(electronPath, require('fs').constants.X_OK);
      return electronPath;
    } catch (err) {
      continue;
    }
  }

  return null;
}

async function startApp() {
  try {
    const electronPath = findElectron();
    
    if (!electronPath) {
      console.error('Electron not found. Please install Electron globally with: npm install -g electron');
      process.exit(1);
    }

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