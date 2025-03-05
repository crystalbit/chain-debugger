import { EmptyStep, Step } from '../../types';
import { StepHandler, StepContext, updateStepStatus } from './types';
import fs from 'fs';

export const emptyStepHandler: StepHandler<EmptyStep> = {
  canHandle: (step: Step): step is EmptyStep => step.type === 'empty',
  
  process: async (step: EmptyStep & { index: number }, context: StepContext) => {
    const { onStepComplete } = context;
    
    // empty steps doesn't report any result
    
    // Notify about step completion
    onStepComplete?.(step.index, 'success');
  }
}; 