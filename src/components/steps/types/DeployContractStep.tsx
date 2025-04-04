import React from 'react';
import { Typography, ListItemIcon } from '@mui/material';
import { Code as TransactionIcon } from '@mui/icons-material';
import { DeployContractStep as DeployContractStepType } from '../../../types';

interface DeployContractStepProps {
  step: DeployContractStepType;
}

export const DeployContractStepRenderer: React.FC<DeployContractStepProps> = ({ step }) => {
  return (
    <>
      <ListItemIcon>
        <TransactionIcon color="info" />
      </ListItemIcon>
      <>
        <Typography component="div" variant="body2" color="text.primary">
          From: {step.from}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary">
          Deployment Bytecode: {step.deploymentBytecode.substring(0, 20)}...
        </Typography>
      </>
    </>
  );
};

// Helper functions for Deploy Contract steps
export const createDeployContractStep = (
  name: string,
  from: string,
  deploymentBytecode: string
): DeployContractStepType => {
  return {
    type: 'deploy_contract',
    name,
    from,
    to: '',
    deploymentBytecode
  };
}; 