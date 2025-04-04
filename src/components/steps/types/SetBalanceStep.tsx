import React from 'react';
import { Typography, ListItemIcon } from '@mui/material';
import { AccountBalance as SetBalanceIcon } from '@mui/icons-material';
import { SetBalanceStep as SetBalanceStepType } from '../../../types';

interface SetBalanceStepProps {
  step: SetBalanceStepType;
}

export const SetBalanceStepRenderer: React.FC<SetBalanceStepProps> = ({ step }) => {
  return (
    <>
      <ListItemIcon>
        <SetBalanceIcon color="success" sx={{ fontSize: '1.5rem' }} />
      </ListItemIcon>
      <>
        <Typography component="div" variant="body2" color="text.primary">
          Address: {step.address}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary">
          Value: {step.value}
        </Typography>
      </>
    </>
  );
};

// Helper functions for Set Balance steps
export const createSetBalanceStep = (name: string, address: string, value: string): SetBalanceStepType => {
  return {
    type: 'set_balance',
    name,
    address,
    value
  };
}; 