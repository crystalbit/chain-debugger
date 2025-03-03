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

export type Step = TransferStep | TransactionStep; 