import React from 'react';
import { Typography, ListItemIcon } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { EmptyStep as EmptyStepType } from '../../../types';

interface EmptyStepProps {
  step: EmptyStepType;
}

export const EmptyStepRenderer: React.FC<EmptyStepProps> = ({ step }) => {
  return (
    <>
      <ListItemIcon>
        <CheckCircleIcon color="disabled" />
      </ListItemIcon>
      <Typography component="div" variant="body2" color="text.secondary">
        Empty step
      </Typography>
    </>
  );
};

// Helper functions for Empty steps
export const createEmptyStep = (name?: string): EmptyStepType => {
  return {
    type: 'empty',
    name: name || `Empty Step`
  };
}; 