import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";

let anvilSingleton: ChildProcessWithoutNullStreams | null = null;

export const PORT = 9996;

export const hasRunningAnvil = (): boolean => {
  return anvilSingleton !== null;
};

export const execAnvilFork = async (rpcUrl: string): Promise<void> => {
  if (anvilSingleton) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    // Add environment variables to disable nightly warnings
    const env = {
      ...process.env,
      FOUNDRY_DISABLE_NIGHTLY_WARNING: "true"
    };

    anvilSingleton = spawn("anvil", [
      "-p",
      PORT.toString(),
      "--auto-impersonate",
      "--fork-url",
      rpcUrl,
    ], { env });

    anvilSingleton.stdout.on('data', (_data) => {
      // console.log(`stdout: ${_data}`);
      // TODO check "Listening on 127.0.0.1:9997"
      resolve();
    });

    anvilSingleton.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      anvilSingleton?.kill();
      anvilSingleton = null;
      reject();
    });

    anvilSingleton.on('close', (_code) => {
      // console.log(`child process exited with code ${code}`);
      anvilSingleton = null;
      reject();
    });
  });
}

export const terminateAnvil = (): boolean => {
  if (!anvilSingleton) {
    console.log("No Anvil process to terminate");
    return false;
  }

  try {
    const result = anvilSingleton.kill();
    console.log("Anvil process terminated:", result);
    anvilSingleton = null;
    return result;
  } catch (error) {
    console.error("Error terminating Anvil process:", error);
    anvilSingleton = null;
    return false;
  }
}