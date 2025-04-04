import { Step, TestCase, EmptyStep } from '../../types';
import { createEmptyStep as createEmptyStepFunc } from './types/EmptyStep';
import { createSetBalanceStep } from './types/SetBalanceStep';
import { createTransferStep } from './types/TransferStep';
import { createApproveStep } from './types/ApproveStep';
import { createTransactionStep } from './types/TransactionStep';
import { createDeployContractStep } from './types/DeployContractStep';

// Clears all simulation data from steps (status, trace, result)
export const clearAllSteps = (steps: Step[]): Step[] => {
  return steps.map(step => ({
    ...step,
    status: undefined,
    trace: undefined,
    result: undefined
  }));
};

// Creates a new empty step
export const createEmptyStep = (name?: string): EmptyStep => {
  return {
    type: 'empty',
    name: name || `Empty Step`
  };
};

// Adds an empty step at the specified index
export const addEmptyStep = (testCase: TestCase, index: number): TestCase => {
  if (!testCase) return testCase;

  const newStep = createEmptyStepFunc(`Empty Step ${testCase.steps.length + 1}`);
  const newSteps = [...testCase.steps];
  newSteps.splice(index, 0, newStep);

  return {
    ...testCase,
    steps: newSteps
  };
};

// Deletes a step at the specified index
export const deleteStep = (testCase: TestCase, index: number): TestCase => {
  if (!testCase) return testCase;

  const newSteps = [...testCase.steps];
  newSteps.splice(index, 1);

  return {
    ...testCase,
    steps: clearAllSteps(newSteps)
  };
};

// Duplicates a step at the specified index
export const duplicateStep = (testCase: TestCase, index: number): TestCase => {
  if (!testCase) return testCase;

  const stepToDuplicate = testCase.steps[index];
  const newStep = {
    ...stepToDuplicate,
    name: `${stepToDuplicate.name} (Copy)`
  };

  const newSteps = [...testCase.steps];
  newSteps.splice(index + 1, 0, newStep);

  return {
    ...testCase,
    steps: clearAllSteps(newSteps)
  };
};

// Moves a step from one index to another
export const moveStep = (testCase: TestCase, fromIndex: number, toIndex: number): TestCase => {
  if (!testCase) return testCase;
  if (fromIndex < 0 || fromIndex >= testCase.steps.length) return testCase;
  if (toIndex < 0 || toIndex >= testCase.steps.length) return testCase;

  const newSteps = [...testCase.steps];
  const [movedStep] = newSteps.splice(fromIndex, 1);
  newSteps.splice(toIndex, 0, movedStep);

  return {
    ...testCase,
    steps: clearAllSteps(newSteps)
  };
};

// Updates or converts a step at the specified index
export const updateStep = (
  testCase: TestCase,
  index: number,
  stepData: {
    name: string;
    type: 'set_balance' | 'transfer' | 'approve' | 'transaction' | 'deploy_contract';
    address?: string;
    value?: string;
    from?: string;
    to?: string;
    spender?: string;
    amount?: string;
    signature?: string;
    arguments?: string;
    deploymentBytecode?: string;
  }
): TestCase => {
  if (!testCase) return testCase;

  const newSteps = [...testCase.steps];
  let updatedStep: Step;

  switch (stepData.type) {
    case 'set_balance':
      updatedStep = createSetBalanceStep(
        stepData.name,
        stepData.address || '',
        stepData.value || ''
      );
      break;
    case 'transfer':
      updatedStep = createTransferStep(
        stepData.name,
        stepData.from || '',
        stepData.to || '',
        stepData.value || ''
      );
      break;
    case 'approve':
      updatedStep = createApproveStep(
        stepData.name,
        stepData.from || '',
        stepData.to || '',
        stepData.spender || '',
        stepData.amount || ''
      );
      break;
    case 'transaction':
      updatedStep = createTransactionStep(
        stepData.name,
        stepData.from || '',
        stepData.to || '',
        stepData.signature || '',
        stepData.arguments || ''
      );
      break;
    case 'deploy_contract':
      updatedStep = createDeployContractStep(
        stepData.name,
        stepData.from || '',
        stepData.deploymentBytecode || ''
      );
      break;
    default:
      return testCase;
  }

  newSteps[index] = updatedStep;

  return {
    ...testCase,
    steps: clearAllSteps(newSteps)
  };
}; 