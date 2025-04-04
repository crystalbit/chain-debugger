import { CheckBalanceStep, Step } from '../../types';
import { StepHandler, StepContext, updateStepStatus } from './types';
import { execCommand } from '../exec-cast';
import fs from 'fs';

// Helper function to calculate divisor without using exponentiation
const calculateDivisor = (decimals: number): bigint => {
  let divisor = BigInt(1);
  for (let i = 0; i < decimals; i++) {
    divisor = divisor * BigInt(10);
  }
  return divisor;
};

export const checkBalanceStepHandler: StepHandler<CheckBalanceStep> = {
  canHandle: (step: Step): step is CheckBalanceStep => step.type === 'check_balance',

  process: async (step: CheckBalanceStep, stepIndex: number, context: StepContext) => {
    const { rpcUrl, filePath, testCase, onStepComplete } = context;

    try {
      // Use cast to get the balance
      const balanceCommand = `cast balance ${step.address} --rpc-url ${rpcUrl}`;
      const result = await execCommand(balanceCommand);

      if (result.stderr) {
        throw new Error(result.stderr);
      }

      // Format the result to be more readable
      const balanceWei = result.stdout.trim();
      const divisor = calculateDivisor(18); // 18 decimals for ETH
      const balanceEther = (BigInt(balanceWei) / divisor).toString();
      const remainderWei = (BigInt(balanceWei) % divisor).toString().padStart(18, '0');
      const formattedBalance = `${balanceEther}.${remainderWei} ETH (${balanceWei} wei)`;

      const trace = `Balance check for ${step.address}`;
      updateStepStatus(step, 'success', trace, formattedBalance);

      // Update the step in the test case array
      testCase.steps[stepIndex] = step;

      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);

    } catch (error) {
      console.error(`Error processing check balance step ${step.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      updateStepStatus(step, 'failed', errorMessage);

      // Update the step in the test case array
      testCase.steps[stepIndex] = step;

      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);
    }
  }
}; 