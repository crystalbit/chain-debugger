import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { platform } from 'os';

let anvilSingleton: ChildProcessWithoutNullStreams | null = null;

export const PORT = 9996;

export const execAnvilFork = async (rpcUrl: string) => {
  if (anvilSingleton) {
    console.log('Anvil process already running');
    return;
  }

  const isWindows = platform() === 'win32';
  const anvilCommand = isWindows ? 'anvil.exe' : 'anvil';

  anvilSingleton = spawn(anvilCommand, [
    '--auto-impersonate',
    '--fork-url',
    rpcUrl,
    '--port',
    PORT.toString()
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: isWindows
  });

  anvilSingleton.stderr?.on('data', (data) => {
    console.error(`Anvil stderr: ${data}`);
  });

  anvilSingleton.on('error', (error) => {
    console.error('Failed to start Anvil:', error);
    if (error.message.includes('ENOENT')) {
      console.error('Anvil is not installed or not in PATH');
    }
  });

  // Wait for Anvil to start
  await new Promise<void>((resolve) => {
    const onData = (data: Buffer) => {
      if (data.toString().includes('Listening on')) {
        anvilSingleton?.stdout?.removeListener('data', onData);
        resolve();
      }
    };
    anvilSingleton?.stdout?.on('data', onData);
  });
};

export const terminateAnvil = () => {
  if (!anvilSingleton) {
    console.log('No Anvil process to terminate');
    return false;
  }

  try {
    const result = anvilSingleton.kill();
    console.log("Anvil process terminated:", result);
    anvilSingleton = null;
    return true;
  } catch (error) {
    console.error('Error terminating Anvil:', error);
    return false;
  }
};