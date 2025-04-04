import React from 'react';
import { Typography, ListItemIcon, Box, SxProps, Theme } from '@mui/material';
import { Code as TransactionIcon } from '@mui/icons-material';
import { TransactionStep as TransactionStepType } from '../../../types';

interface TransactionStepProps {
  step: TransactionStepType;
}

export const TransactionStepRenderer: React.FC<TransactionStepProps> = ({ step }) => {
  // Define a common style object for all Typography components
  const typographyStyle: SxProps<Theme> = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '80vw',
  };

  return (
    <>
      <ListItemIcon>
        <TransactionIcon color="info" />
      </ListItemIcon>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Typography component="div" variant="body2" color="text.primary" sx={typographyStyle}>
          From: {step.from}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary" sx={typographyStyle}>
          To: {step.to}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary" sx={typographyStyle}>
          Signature: {step.signature}
        </Typography>
        <Typography component="div" variant="body2" color="text.primary" sx={typographyStyle}>
          Arguments: {step.arguments}
        </Typography>
      </Box>
    </>
  );
};

// Helper functions for Transaction steps
export const createTransactionStep = (
  name: string,
  from: string,
  to: string,
  signature: string,
  arguments_: string
): TransactionStepType => {
  return {
    type: 'transaction',
    name,
    from,
    to,
    signature,
    arguments: arguments_
  };
}; 