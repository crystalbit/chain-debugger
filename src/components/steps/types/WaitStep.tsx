import React from 'react';
import { Typography, ListItemIcon, Box, Tooltip } from '@mui/material';
import { TimerOutlined as WaitIcon } from '@mui/icons-material';
import { WaitStep as WaitStepType } from '../../../types';
import { formatSeconds } from '../../../utils/time';

interface WaitStepProps {
  step: WaitStepType;
}

export const WaitStepRenderer: React.FC<WaitStepProps> = ({ step }) => {
  const formattedTime = formatSeconds(step.seconds);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <WaitIcon fontSize="small" />
        </ListItemIcon>
        <Tooltip title={`${step.seconds} seconds`} placement="top">
          <Typography variant="body2">
            Wait for {formattedTime}
          </Typography>
        </Tooltip>
      </Box>
    </>
  );
};

// Helper function for Wait steps
export const createWaitStep = (name: string, seconds: string): WaitStepType => {
  return {
    type: 'wait',
    name,
    seconds
  };
}; 