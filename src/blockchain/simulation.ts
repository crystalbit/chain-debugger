/**
 * Simulation module for blockchain test cases
 * v1.0.14
 */

import fs from "fs";
import { execAnvilFork, PORT, terminateAnvil } from "./fork-work";
import { execCommand } from "./exec-cast";
import { Step } from "../types";
import {
  emptyStepHandler,
  transactionStepHandler,
  transferStepHandler,
  approveStepHandler,
  setBalanceStepHandler,
  deployContractStepHandler,
  checkBalanceStepHandler,
  checkTokenBalanceStepHandler,
  waitStepHandler,
  StepHandler,
  updateStepStatus
} from "./steps";

const handlers: Array<StepHandler<any>> = [
  emptyStepHandler,
  transactionStepHandler,
  transferStepHandler,
  approveStepHandler,
  setBalanceStepHandler,
  deployContractStepHandler,
  checkBalanceStepHandler,
  checkTokenBalanceStepHandler,
  waitStepHandler
];

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
  stepIndex: number,
  filePath: string,
  testCase: any,
  onStepComplete?: (stepIndex: number, status: 'success' | 'failed') => void
) => {
  const context = {
    rpcUrl: `http://127.0.0.1:${PORT}`,
    filePath,
    testCase,
    onStepComplete
  };

  const handler = handlers.find(h => h.canHandle(step));
  if (handler) {
    try {
      await handler.process(step, stepIndex, context);
    } catch (error) {
      console.error(`Error processing step ${stepIndex}:`, error);
      onStepComplete?.(stepIndex, 'failed');
    }
  } else {
    console.error(`No handler found for step type: ${step.type}`);
    updateStepStatus(step, 'failed', `No handler found for step type: ${step.type}`);
    onStepComplete?.(stepIndex, 'failed');
  }
};

export const simulateTestCase = async (
  filePath: string,
  onStepComplete?: (stepIndex: number, status: 'success' | 'failed') => void
) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const testCase = JSON.parse(fileContent);

    // Clean up all steps before starting
    testCase.steps.forEach((step: Step) => {
      if ('status' in step) delete (step as any).status;
      if ('trace' in step) delete (step as any).trace;
      if ('result' in step) delete (step as any).result;
    });

    await setEnvironment(testCase.config.rpcUrl);

    // Process each step sequentially
    for (let i = 0; i < testCase.steps.length; i++) {
      await processStep(testCase.steps[i], i, filePath, testCase, onStepComplete);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in simulateTestCase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    await terminateAnvil();
  }
};
