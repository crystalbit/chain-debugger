export interface JsonFile {
  name: string;
  path: string;
  stepCount: number | 'error';
}

export interface Config {
  rpcUrl: string;
}

export interface TestCase {
  config: Config;
  steps: Step[];
}

interface BaseStep {
  name: string;
  from: string;
  to: string;
  trace?: string;
  result?: string;
  status?: 'success' | 'failed';
}

export interface TransferStep extends BaseStep {
  type: 'transfer';
  value: string;
}

export interface TransactionStep extends BaseStep {
  type: 'transaction';
  signature: string;
  arguments: string;
}

export interface ApproveStep extends BaseStep {
  type: 'approve';
  spender: string;
  amount: string;
}

export interface SetBalanceStep extends BaseStep {
  type: 'set_balance';
  address: string;
  value: string;
}

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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface ElectronAPI {
  selectDirectory: () => Promise<string | undefined>;
  getLastDirectory: () => Promise<string | undefined>;
  listJsonFiles: (dirPath: string) => Promise<JsonFile[]>;
  readFile: (filePath: string) => Promise<string>;
  simulateTestCase: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  onStepComplete: (callback: (event: any, data: { index: number; status: 'success' | 'failed'; step: Step }) => void) => void;
  removeStepCompleteListener: (callback: (event: any, data: { index: number; status: 'success' | 'failed'; step: Step }) => void) => void;
} 