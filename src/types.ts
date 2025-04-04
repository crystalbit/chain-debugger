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

export type BaseStep = {
  name: string;
  trace?: string;
  result?: string;
  status?: "success" | "failed";
};

export type BaseTransactionStep = BaseStep & {
  from: string;
  to: string;
};

export type TransactionStep = BaseTransactionStep & {
  type: "transaction";
  signature: string;
  arguments: string;
};

export type TransferStep = BaseTransactionStep & {
  type: "transfer";
  value: string;
};

export type ApproveStep = BaseTransactionStep & {
  type: "approve";
  spender: string;
  amount: string;
};

export type SetBalanceStep = BaseStep & {
  type: "set_balance";
  address: string;
  value: string;
};

export type EmptyStep = BaseStep & {
  type: "empty";
};

export type DeployContractStep = BaseTransactionStep & {
  type: "deploy_contract";
  deploymentBytecode: string;
};

export type Step = EmptyStep | SetBalanceStep | TransferStep | ApproveStep | TransactionStep | DeployContractStep;

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
  writeFile: (filePath: string, content: string) => Promise<void>;
  simulateTestCase: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  onStepComplete: (callback: (event: any, data: { index: number; status: 'success' | 'failed'; step: Step }) => void) => void;
  removeStepCompleteListener: (callback: (event: any, data: { index: number; status: 'success' | 'failed'; step: Step }) => void) => void;
} 