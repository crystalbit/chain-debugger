/**
 * Simulation module for blockchain test cases
 * v1.0.14
 */

import fs from "fs";
import { execAnvilFork, PORT, terminateAnvil } from "./fork-work";
import { execCommand } from "./exec-cast";
import { getResultData, TxResult } from "./parser";

export type Step = 
| {
    name: string;
    type: "transaction";
    from: string;
    to: string;
    signature: string;
    arguments: string;
    trace?: string;
    result?: string;
    status?: "success" | "failed";
    index?: number;
  }
| {
    name: string;
    type: "transfer";
    from: string;
    to: string;
    value: string;
    trace?: string;
    result?: string;
    status?: "success" | "failed";
    index?: number;
  }
| {
    name: string;
    type: "approve";
    from: string;
    to: string;
    spender: string;
    amount: string;
    trace?: string;
    result?: string;
    status?: "success" | "failed";
    index?: number;
  }
| {
    name: string;
    type: "set_balance";
    address: string;
    value: string;
    trace?: string;
    result?: string;
    status?: "success" | "failed";
    index?: number;
  };

const setEnvironment = async (rpcUrl: string) => {
  console.log("Setting up anvil fork...", rpcUrl);
  await execAnvilFork(rpcUrl);
  console.log("Fork started");
  const castInjectCommand = `cast rpc anvil_setCode 0x0000000000000000000000000000000000000064 0x6080604052348015600e575f5ffd5b50600436106026575f3560e01c8063a3b1b31d14602a575b5f5ffd5b4360405190815260200160405180910390f3fea26469706673582212205b62f2339f15a02a7786f3cfde869d9dfbbc7c5089cab69b981dc169170b3ddf64736f6c634300081c0033 --rpc-url http://127.0.0.1:${PORT}`;
  await execCommand(castInjectCommand);
  console.log("Arbitrum precompile injected");
  const castMineCommand = `cast rpc anvil_mine 1 --rpc-url http://127.0.0.1:${PORT}`;
  await execCommand(castMineCommand);
  console.log("One block mined");
};

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

const processStep = async (
  step: Step,
  filePath: string,
  testCase: any,
  onStepComplete?: (stepIndex: number, status: 'success' | 'failed') => void
) => {
  const rpcUrl = `http://127.0.0.1:${PORT}`;
  let success = false;
  let errorMessage = '';
  let command = ''; // Initialize command variable

  try {
    if (step.type === "transfer") {
      command = `cast send ${step.to} --value "${step.value}" --from ${step.from} --unlocked --rpc-url ${rpcUrl}`;
    } else if (step.type === "approve") {
      command = `cast send ${step.to} "approve(address,uint256)" ${step.spender} "${step.amount}" --from ${step.from} --unlocked --rpc-url ${rpcUrl}`;
    } else if (step.type === "set_balance") {
      const weiValue = toWei(step.value);
      const hexValue = toHex(weiValue);
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
      
      // Then mine a block
      const mineCommand = `cast rpc anvil_mine 1 --rpc-url ${rpcUrl}`;
      await execCommand(mineCommand);
      
      try {
        const response = JSON.parse(result);
        step.trace = response.error 
          ? `Error: ${response.error.message}`
          : `Successfully set balance for ${step.address} to ${step.value}`;
        success = !response.error;
      } catch (e) {
        step.trace = `Successfully set balance for ${step.address} to ${step.value}`;
        success = true;
      }
      // Set status immediately after set_balance operation
      step.status = success ? "success" : "failed";
      fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
      onStepComplete?.(step.index!, step.status!);
    } else {
      command = `cast send ${step.to} "${step.signature}" ${step.arguments} --from ${step.from} --unlocked --rpc-url ${rpcUrl}`;
    }

    if (step.type !== "set_balance") {
      console.log(`Executing command: ${command}`);
      const result = await execCommand(command);
      console.log(`Command result: ${result}`);
      
      const resultData = getResultData(result);
      console.log(`Parsed result data:`, resultData);
      
      if (resultData.status === 1) {
        // Set success status immediately after successful transaction
        step.status = "success";
        
        // For successful transactions, use cast run
        const traceCommand = `cast run ${resultData.hash} --rpc-url ${rpcUrl}`;
        console.log(`Getting trace with command: ${traceCommand}`);
        const trace = await execCommand(traceCommand);
        console.log(`Trace result: ${trace}`);
        step.trace = trace;
        success = true;
        fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
        onStepComplete?.(step.index!, step.status!);
      } else {
        // Set failed status immediately after failed transaction
        step.status = "failed";
        
        // For failed transactions, use cast call with --trace
        let traceCommand: string;
        if (step.type === "transfer") {
          traceCommand = `cast call ${step.to} --value "${step.value}" --from ${step.from} --rpc-url ${rpcUrl} --trace`;
        } else if (step.type === "approve") {
          traceCommand = `cast call ${step.to} "approve(address,uint256)" ${step.spender} ${step.amount} --from ${step.from} --rpc-url ${rpcUrl} --trace`;
        } else {
          traceCommand = `cast call ${step.to} "${step.signature}" ${step.arguments} --from ${step.from} --rpc-url ${rpcUrl} --trace`;
        }
        console.log(`Getting trace with command: ${traceCommand}`);
        const trace = await execCommand(traceCommand, true);
        console.log(`Trace result: ${trace}`);
        step.trace = trace;
        step.result = result; // Store the revert data in result
        success = false;
        fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
        onStepComplete?.(step.index!, step.status!);
      }
    }
  } catch (error) {
    console.error(`Error processing step ${step.name}:`, error);
    errorMessage = error instanceof Error ? error.message : String(error);
    
    // Set failed status immediately after error
    step.status = "failed";
    
    if (step.type !== "set_balance") {
      // Get trace for failed transaction
      let traceCommand: string;
      if (step.type === "transfer") {
        traceCommand = `cast call ${step.to} --value "${step.value}" --from ${step.from} --rpc-url ${rpcUrl} --trace`;
      } else if (step.type === "approve") {
        traceCommand = `cast call ${step.to} "approve(address,uint256)" ${step.spender} ${step.amount} --from ${step.from} --rpc-url ${rpcUrl} --trace`;
      } else {
        traceCommand = `cast call ${step.to} "${step.signature}" ${step.arguments} --from ${step.from} --rpc-url ${rpcUrl} --trace`;
      }
      console.log(`Getting trace with command: ${traceCommand}`);
      const trace = await execCommand(traceCommand, true);
      console.log(`Trace result: ${trace}`);
      step.trace = trace;
    } else {
      step.trace = errorMessage;
    }
    success = false;
    fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
    onStepComplete?.(step.index!, step.status!);
  }
};

export const simulateTestCase = async (
  filePath: string,
  onStepComplete?: (stepIndex: number, status: 'success' | 'failed') => void
) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const testCase = JSON.parse(content);
  const totalSteps = testCase.steps.length;
  const isDev = true;
  console.log("Development mode:", isDev);
  console.log(`Total steps to process: ${totalSteps}`);

  try {
    // Clean up all steps before starting
    testCase.steps.forEach((step: Step) => {
      delete step.status;
      delete step.trace;
      delete step.result;
      delete step.index;
    });

    // Set up environment first, before any steps
    console.log("\nSetting up environment...");
    await setEnvironment(testCase.config.rpcUrl);
    console.log("Environment setup complete\n");

    // Now process steps
    for (let i = 0; i < totalSteps; i++) {
      const step = testCase.steps[i];
      step.index = i;
      
      // Add delay before each step except the first one in development mode
      if (isDev && i > 0) {
        console.log("\nWaiting 1 seconds before next step...");
        await new Promise(resolve => setTimeout(resolve, 1_000));
      }

      console.log(`\n======= Processing step ${i + 1} of ${totalSteps}: ${step.name} =======`);
      
      try {
        await processStep(step, filePath, testCase, onStepComplete);
        console.log(`Step ${i + 1} completed successfully`);
      } catch (error) {
        console.error(`Error in step ${i + 1}:`, error);
        step.status = 'failed';
        fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2), 'utf-8');
        onStepComplete?.(i, 'failed');
        return;
      }

      if (step.status === 'failed') {
        console.log(`Step ${i + 1} failed, stopping simulation`);
        return;
      }
    }
    
    console.log("\nSimulation completed successfully");
  } catch (error) {
    console.error("Simulation failed:", error);
    throw error;
  } finally {
    console.log("\nCleaning up...");
    const terminated = terminateAnvil();
    console.log("Anvil process terminated:", terminated);
  }
};
