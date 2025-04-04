import { WaitStep, Step } from '../../types';
import { StepHandler, StepContext, updateStepStatus } from './types';
import { execCommand } from '../exec-cast';
import { formatSeconds } from '../../utils/time';
import fs from 'fs';

export const waitStepHandler: StepHandler<WaitStep> = {
  canHandle: (step: Step): step is WaitStep => step.type === 'wait',

  process: async (step: WaitStep, stepIndex: number, context: StepContext) => {
    const { rpcUrl, filePath, testCase, onStepComplete } = context;
    const seconds = parseInt(step.seconds);
    const humanReadableTime = formatSeconds(seconds);

    try {
      // Use cast rpc to warp time by specified seconds
      const warpCommand = `cast rpc anvil_increaseTime ${seconds} --rpc-url ${rpcUrl}`;
      console.log(`Executing command: ${warpCommand}`);
      const warpResult = await execCommand(warpCommand);
      console.log(`Warp result: ${JSON.stringify(warpResult)}`);

      // Mine a block to apply the time change
      const mineCommand = `cast rpc anvil_mine 1 --rpc-url ${rpcUrl}`;
      console.log(`Mining block with command: ${mineCommand}`);
      await execCommand(mineCommand);

      const trace = `Successfully warped time by ${seconds} seconds (${humanReadableTime})`;
      updateStepStatus(step, 'success', trace);

      // Update the step in the test case array
      testCase.steps[stepIndex] = step;

      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);
    } catch (error) {
      console.error(`Error processing wait step ${step.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      updateStepStatus(step, 'failed', `Failed to warp time by ${humanReadableTime}: ${errorMessage}`);

      // Update the step in the test case array
      testCase.steps[stepIndex] = step;

      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);
    }
  }
}; 