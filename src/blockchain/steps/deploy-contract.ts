import { DeployContractStep, Step } from '../../types';
import { StepHandler, StepContext, updateStepStatus } from './types';
import { execCommand } from '../exec-cast';
import { getResultData } from '../parser';
import fs from 'fs';

export const deployContractStepHandler: StepHandler<DeployContractStep> = {
  canHandle: (step: Step): step is DeployContractStep => step.type === 'deploy_contract',

  process: async (step: DeployContractStep, stepIndex: number, context: StepContext) => {
    const { rpcUrl, filePath, testCase, onStepComplete } = context;
    const command = `cast send --from ${step.from} --unlocked --rpc-url ${rpcUrl} --create ${step.deploymentBytecode}`;

    try {
      console.log(`Executing command: ${command}`);
      const result = await execCommand(command);
      console.log(`Command result: ${result}`);

      const resultData = getResultData(result);
      console.log(`Parsed result data:`, resultData);

      if (resultData.status === 1) {
        const traceCommand = `cast run ${resultData.hash} --rpc-url ${rpcUrl}`;
        console.log(`Getting trace with command: ${traceCommand}`);
        const trace = await execCommand(traceCommand);
        console.log(`Trace result: ${trace}`);

        // Extract the deployed contract address from the result
        const deployedAddress = "0x"; // resultData.contractAddress;
        if (deployedAddress) {
          // Add the deployed address to the step result for reference
          step.result = `Deployed at: ${deployedAddress}\n${result}`;
        }

        updateStepStatus(step, 'success', trace);
      } else {
        // If the transaction status is not 1, the deployment failed
        const traceCommand = `cast run ${resultData.hash} --rpc-url ${rpcUrl}`;
        console.log(`Getting trace with command: ${traceCommand}`);
        const trace = await execCommand(traceCommand, true);
        console.log(`Trace result: ${trace}`);

        updateStepStatus(step, 'failed', trace, result);
      }

      // Update the step in the test case array
      testCase.steps[stepIndex] = step;

      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);

    } catch (error) {
      console.error(`Error processing deploy contract step ${step.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Since we can't call the contract creation directly, we'll just update the status
      updateStepStatus(step, 'failed', undefined, errorMessage);

      // Update the step in the test case array
      testCase.steps[stepIndex] = step;

      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);
    }
  }
}; 