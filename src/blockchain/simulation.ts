import fs from "fs";
import path from "path";
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

const processStep = async (step: Step) => {
  const rpcUrl = `http://127.0.0.1:${PORT}`;
  // 1. trace to store in case tx fails
  // 2. send tx
  // 3. get trace of successful tx

  // Format value with ether unit if it's a decimal number
  const formatValue = (value: string) => {
    // Remove quotes if present
    value = value.replace(/['"]/g, '');
    // Add quotes only if value contains spaces
    return value.includes(' ') ? `"${value}"` : value;
  };

  // 1. do trace - it will be needed only if tx will fail (we will get the trace from here)
  let preTraceCommand: string;
  let preTraceResult: string;
  console.log(1);
  if (step.type === "transaction") {
    preTraceCommand = `cast call ${step.to} "${step.signature}" ${step.arguments} --from ${step.from} --trace --rpc-url ${rpcUrl}`;
    console.log({preTraceCommand})
    preTraceResult = await execCommand(preTraceCommand, true);
    console.log({preTraceResult})
  } else if (step.type === "transfer") {
    const value = formatValue(step.value);
    preTraceCommand = `cast call ${step.to} --value ${value} --from ${step.from} --rpc-url ${rpcUrl}`;
    preTraceResult = await execCommand(preTraceCommand, true);
  } else {
    throw new Error("Unknown step type");
  }

  // 2. send impersonated tx to fork - we can send tx from any address
  console.log(2);
  let sendCommand: string;
  let sendResult: string = "";
  let result: TxResult;
  try {
    if (step.type === "transaction") {
      sendCommand = `cast send ${step.to} "${step.signature}" ${step.arguments} --unlocked --from ${step.from} --rpc-url ${rpcUrl}`;
      sendResult = await execCommand(sendCommand);
    } else if (step.type === "transfer") {
      const value = formatValue(step.value);
      sendCommand = `cast send ${step.to} --value ${value} --unlocked --from ${step.from} --rpc-url ${rpcUrl}`;
      sendResult = await execCommand(sendCommand);
    } else {
      throw new Error("Unknown step type");
    }
    result = getResultData(sendResult);
    console.log("result", result);
  } catch (e) {
    console.log("send failed", e);
    step.result = sendResult;
    step.trace = preTraceResult;
    step.status = "failed";
    console.log(preTraceResult);
    return;
  }

  if (!result.status || result.status === 0) {
    console.log("tx failed");
    step.trace = preTraceResult;
    step.status = "failed";
  } else if (result.status === 1) {
    console.log("tx success");
    step.status = "success";
  } else {
    throw new Error("Unknown tx status: " + result.status);
  }

  if (result.status === 1) {
    // 3. get trace of successful tx
    const traceCommand = `cast run ${result.hash} --rpc-url ${rpcUrl}`;
    const traceResult = await execCommand(traceCommand);
    step.trace = traceResult;
    console.log("traceResult", traceResult);
  }
};

export const simulateTestCase = async (
  filePath: string,
  onProgress?: (stepIndex: number) => void
) => {
  const _case = fs.readFileSync(filePath, "utf8");
  const caseJson = JSON.parse(_case);

  const rpcUrl = caseJson.config.rpcUrl;
  if (!rpcUrl) {
    throw new Error("rpcUrl is required");
  }

  await setEnvironment(rpcUrl);
  const steps: Step[] = caseJson.steps;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log("======= " + step.name + " =======");
    try {
      onProgress?.(i);
      await processStep(step);
      // Write intermediate results after each step
      fs.writeFileSync(filePath, JSON.stringify(caseJson, null, 2));
      
      // Stop if step failed
      if (step.status === "failed") {
        console.log("Step failed, stopping simulation");
        break;
      }
    } catch (e: any) {
      console.log("Error processing step", e);
      step.status = "failed";
      step.result = e.message || String(e);
      // Write results and stop
      fs.writeFileSync(filePath, JSON.stringify(caseJson, null, 2));
      break;
    }
  }
  // Write final results
  fs.writeFileSync(filePath, JSON.stringify(caseJson, null, 2));
};

// Comment out the auto-execution since we'll call it from the test script
// main().finally(() => {
//   terminateAnvil();
// });
