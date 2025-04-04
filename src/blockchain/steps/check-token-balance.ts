import { CheckTokenBalanceStep, Step } from '../../types';
import { StepHandler, StepContext, updateStepStatus } from './types';
import { execCommand } from '../exec-cast';
import fs from 'fs';

// ERC20 balanceOf function selector: 0x70a08231
const BALANCE_OF_SELECTOR = '0x70a08231';

// Helper function to calculate divisor without using exponentiation
const calculateDivisor = (decimals: number): bigint => {
  let divisor = BigInt(1);
  for (let i = 0; i < decimals; i++) {
    divisor = divisor * BigInt(10);
  }
  return divisor;
};

export const checkTokenBalanceStepHandler: StepHandler<CheckTokenBalanceStep> = {
  canHandle: (step: Step): step is CheckTokenBalanceStep => step.type === 'check_token_balance',

  process: async (step: CheckTokenBalanceStep, stepIndex: number, context: StepContext) => {
    const { rpcUrl, filePath, testCase, onStepComplete } = context;

    try {
      // Call balanceOf on the token contract
      const balanceCommand = `cast call ${step.token} "balanceOf(address)" ${step.address} --rpc-url ${rpcUrl}`;
      console.log(balanceCommand);
      const result = await execCommand(balanceCommand);

      if (result.stderr) {
        throw new Error(result.stderr);
      }

      // Parse the balance result
      const balanceHex = result.stdout.trim();
      const balanceWei = BigInt(balanceHex).toString();

      // Get token decimals to format the result
      let decimals = 18; // Default to 18 decimals
      try {
        // Call decimals() on the token contract (selector: 0x313ce567)
        const decimalsCommand = `cast call ${step.token} "0x313ce567" --rpc-url ${rpcUrl}`;
        const decimalResult = await execCommand(decimalsCommand);
        decimals = parseInt(decimalResult.stdout, 16);
      } catch (error) {
        console.warn('Could not determine token decimals, using default of 18:', error);
      }

      // Format the balance with proper decimal places
      const divisor = calculateDivisor(decimals);
      const wholeTokens = (BigInt(balanceWei) / divisor).toString();
      const fractionalPart = (BigInt(balanceWei) % divisor).toString().padStart(decimals, '0');
      const formattedBalance = `${wholeTokens}.${fractionalPart} Tokens (${balanceWei} wei)`;

      const trace = `Token balance check for ${step.address} on token ${step.token}`;
      updateStepStatus(step, 'success', trace, formattedBalance);

      // Update the step in the test case array
      testCase.steps[stepIndex] = step;

      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);

    } catch (error) {
      console.error(`Error processing check token balance step ${step.name}:`, error);
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