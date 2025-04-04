import { exec } from "child_process";


export const execCommand = async (command: string, noError = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Add environment variables to disable nightly warnings
    const env = {
      ...process.env,
      FOUNDRY_DISABLE_NIGHTLY_WARNING: "true"
    };

    exec(command, { env }, (error: any, stdout: string, stderr: any) => {
      if (error && !noError) {
        // console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      if (stderr && !noError) {
        // console.error(`stderr: ${stderr}`);
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
}
