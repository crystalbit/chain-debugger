import { exec } from "child_process";


export const execCommand = async (command: string, noError = false): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error: any, stdout: string, stderr: any) => {
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
