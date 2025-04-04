import React from 'react';
import { Typography, ListItemIcon } from '@mui/material';
import { VerifiedUser as ApproveIcon } from '@mui/icons-material';
import { ApproveStep as ApproveStepType } from '../../../types';

interface ApproveStepProps {
  step: ApproveStepType;
}

export const ApproveStepRenderer: React.FC<ApproveStepProps> = ({ step }) => {
  return (
    <>
      <ListItemIcon>
        <ApproveIcon color="warning" />
      </ListItemIcon>
      <>
        <Typography component="div" variant="body2" color="text.primary">
          From: {step.from}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary">
          To: {step.to}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary">
          Spender: {step.spender}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary">
          Amount: {step.amount}
        </Typography>
      </>
    </>
  );
};

// Helper functions for Approve steps
export const createApproveStep = (
  name: string,
  from: string,
  to: string,
  spender: string,
  amount: string
): ApproveStepType => {
  return {
    type: 'approve',
    name,
    from,
    to,
    spender,
    amount
  };
}; 