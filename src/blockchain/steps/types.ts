import { Step } from '../../types';

export interface StepContext {
  rpcUrl: string;
  filePath: string;
  testCase: any;
  onStepComplete?: (stepIndex: number, status: 'success' | 'failed') => void;
}

export interface StepHandler<T extends Step = Step> {
  canHandle: (step: Step) => step is T;
  process: (step: T & { index: number }, context: StepContext) => Promise<void>;
}

export const updateStepStatus = (
  step: Step,
  status: 'success' | 'failed',
  trace?: string,
  result?: string
) => {
  step.status = status;
  if (trace) {
    step.trace = trace;
  }
  if (result) {
    step.result = result;
  }
}; 