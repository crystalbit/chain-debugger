import React from 'react';
import { Typography, ListItemIcon } from '@mui/material';
import { SwapHoriz as TransferIcon } from '@mui/icons-material';
import { TransferStep as TransferStepType } from '../../../types';

interface TransferStepProps {
  step: TransferStepType;
}

export const TransferStepRenderer: React.FC<TransferStepProps> = ({ step }) => {
  return (
    <>
      <ListItemIcon>
        <TransferIcon color="primary" />
      </ListItemIcon>
      <>
        <Typography component="div" variant="body2" color="text.primary">
          From: {step.from}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary">
          To: {step.to}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary">
          Value: {step.value}
        </Typography>
      </>
    </>
  );
};

// Helper functions for Transfer steps
export const createTransferStep = (name: string, from: string, to: string, value: string): TransferStepType => {
  return {
    type: 'transfer',
    name,
    from,
    to,
    value
  };
}; 