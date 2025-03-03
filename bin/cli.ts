#!/usr/bin/env node

import { spawnSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Get the path to electron executable
const electronPath = require('electron');

// Get the path to the project root and build directory
const binDir = __dirname;
const projectRoot = binDir.includes('build/bin') 
  ? path.resolve(binDir, '../..')  // When running from installed location
  : path.resolve(binDir, '..');    // When running from source

const buildIndexPath = path.join(projectRoot, 'build', 'index.html');
const electronJsPath = path.join(projectRoot, 'build', 'electron.js');

// Only build if the build directory doesn't exist or is empty
if (!fs.existsSync(buildIndexPath)) {
  console.log('Built files not found. Building the application...');
  const buildResult = spawnSync('npm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  if (buildResult.error || (buildResult.status !== 0)) {
    console.error('Build failed');
    process.exit(1);
  }
  console.log('Build completed.');
}

// Verify that the electron.js file exists
if (!fs.existsSync(electronJsPath)) {
  console.error('Could not find electron.js at:', electronJsPath);
  console.error('Project root:', projectRoot);
  console.error('__dirname:', __dirname);
  process.exit(1);
}

// Set environment variable to production
process.env.NODE_ENV = 'production';
process.env.ELECTRON_START_URL = `file://${buildIndexPath}`;

console.log('Starting application...');
console.log('Project root:', projectRoot);
console.log('Electron path:', electronPath);
console.log('Electron.js path:', electronJsPath);
console.log('Index.html path:', buildIndexPath);

// Spawn Electron with our app
const proc = spawn(electronPath, [electronJsPath], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'production',
    ELECTRON_START_URL: `file://${buildIndexPath}`
  }
});

proc.on('close', (code) => {
  process.exit(code || 0);
}); 