import { SetBalanceStep, Step } from '../../types';
import { StepHandler, StepContext, updateStepStatus } from './types';
import { execCommand } from '../exec-cast';
import fs from 'fs';

const toWei = (value: string): string => {
  if (value.includes('ether')) {
    const [number] = value.split(' ether');
    const [whole, decimal] = number.split('.');
    const decimalPlaces = decimal ? decimal.length : 0;
    
    // Pad with zeros to get to 18 decimal places
    const paddedNumber = decimal 
      ? whole + decimal.padEnd(18, '0').slice(0, 18)
      : whole + '0'.repeat(18);
    
    return paddedNumber;
  }
  return value;
};

const toHex = (value: string): string => {
  return '0x' + BigInt(value).toString(16);
};

export const setBalanceStepHandler: StepHandler<SetBalanceStep> = {
  canHandle: (step: Step): step is SetBalanceStep => step.type === 'set_balance',
  
  process: async (step: SetBalanceStep & { index: number }, context: StepContext) => {
    const { rpcUrl, filePath, testCase, onStepComplete } = context;
    const weiValue = toWei(step.value);
    const hexValue = toHex(weiValue);
    
    try {
      const jsonData = {
        method: "anvil_setBalance",
        params: [step.address, hexValue],
        id: 1,
        jsonrpc: "2.0"
      };
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
      });
      
      const result = await response.text();
      
      // Mine a block after setting balance
      const mineCommand = `cast rpc anvil_mine 1 --rpc-url ${rpcUrl}`;
      await execCommand(mineCommand);
      
      try {
        const parsedResponse = JSON.parse(result);
        const trace = parsedResponse.error 
          ? `Error: ${parsedResponse.error.message}`
          : `Successfully set balance for ${step.address} to ${step.value}`;
        
        updateStepStatus(step, parsedResponse.error ? 'failed' : 'success', trace);
      } catch (e) {
        const trace = `Successfully set balance for ${step.address} to ${step.value}`;
        updateStepStatus(step, 'success', trace);
      }
      
      // Update the step in the test case array
      testCase.steps[step.index] = step;
      
      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(step.index, step.status!);
      
    } catch (error) {
      console.error(`Error processing set balance step ${step.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      updateStepStatus(step, 'failed', errorMessage);
      
      // Update the step in the test case array
      testCase.steps[step.index] = step;
      
      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(step.index, step.status!);
    }
  }
}; 