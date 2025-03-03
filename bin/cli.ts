#!/usr/bin/env node

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

async function installElectron(): Promise<string> {
  return new Promise((resolve, reject) => {
    const projectRoot = path.resolve(__dirname, '..');
    const electronPath = path.join(projectRoot, 'node_modules', 'electron');

    // Create a temporary package.json if it doesn't exist
    const tempPackageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(tempPackageJsonPath)) {
      fs.writeFileSync(tempPackageJsonPath, JSON.stringify({
        name: 'temp-electron-install',
        version: '1.0.0',
        private: true
      }));
    }

    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const install = spawn(npm, ['install', 'electron@34.3.0', '--no-save'], {
      cwd: projectRoot,
      stdio: 'inherit'
    });

    install.on('error', reject);
    install.on('exit', (code) => {
      if (code === 0) {
        resolve(require(electronPath));
      } else {
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
  });
}

async function startApp() {
  try {
    console.log('Ensuring Electron is available...');
    const electronPath = await installElectron();

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