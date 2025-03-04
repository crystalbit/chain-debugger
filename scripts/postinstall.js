const fs = require('fs');
const path = require('path');

const cliPath = path.join(__dirname, '..', 'build', 'bin', 'cli.js');

// Make cli.js executable on Unix-like systems
if (process.platform !== 'win32') {
  try {
    fs.chmodSync(cliPath, '755');
    console.log('Made cli.js executable');
  } catch (error) {
    console.error('Error making cli.js executable:', error);
  }
}

// Ensure line endings are correct for the platform
try {
  let content = fs.readFileSync(cliPath, 'utf8');
  content = content.replace(/\r\n/g, '\n');
  if (process.platform === 'win32') {
    content = content.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(cliPath, content);
  console.log('Updated line endings for the platform');
} catch (error) {
  console.error('Error updating line endings:', error);
} 