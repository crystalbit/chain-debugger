export interface JsonFile {
  name: string;
  path: string;
  stepCount: number | 'error';
}

export interface TestConfig {
  rpcUrl: string;
}

export interface BaseStep {
  name: string;
  type: 'transfer' | 'transaction';
  from: string;
  to: string;
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

export interface TestCase {
  config: TestConfig;
  steps: Step[];
} 