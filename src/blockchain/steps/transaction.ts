import { TransactionStep, Step } from '../../types';
import { StepHandler, StepContext, updateStepStatus } from './types';
import { execCommand } from '../exec-cast';
import { getResultData } from '../parser';
import fs from 'fs';

export const transactionStepHandler: StepHandler<TransactionStep> = {
  canHandle: (step: Step): step is TransactionStep => step.type === 'transaction',
  
  process: async (step: TransactionStep, stepIndex: number, context: StepContext) => {
    const { rpcUrl, filePath, testCase, onStepComplete } = context;
    const command = `cast send ${step.to} "${step.signature}" ${step.arguments} --from ${step.from} --unlocked --rpc-url ${rpcUrl}`;
    
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
        
        updateStepStatus(step, 'success', trace);
      } else {
        const traceCommand = `cast call ${step.to} "${step.signature}" ${step.arguments} --from ${step.from} --rpc-url ${rpcUrl} --trace`;
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
      console.error(`Error processing transaction step ${step.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      const traceCommand = `cast call ${step.to} "${step.signature}" ${step.arguments} --from ${step.from} --rpc-url ${rpcUrl} --trace`;
      console.log(`Getting trace with command: ${traceCommand}`);
      const trace = await execCommand(traceCommand, true);
      
      updateStepStatus(step, 'failed', trace, errorMessage);
      
      // Update the step in the test case array
      testCase.steps[stepIndex] = step;
      
      // Save changes to the test case file
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(stepIndex, step.status!);
    }
  }
}; 