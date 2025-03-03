#!/usr/bin/env node

import { spawn } from 'child_process';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const electronPath = require('electron');
const electronJsPath = path.join(projectRoot, 'electron.js');
const indexHtmlPath = path.join(projectRoot, 'index.html');

console.log('Starting application...');
console.log('Project root:', projectRoot);
console.log('Loading URL:', `file://${indexHtmlPath}`);

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