import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Token as TokenIcon } from '@mui/icons-material';
import { CheckTokenBalanceStep } from '../../../types';

// Create a new Check Token Balance step
export const createCheckTokenBalanceStep = (
  name: string,
  token: string,
  address: string
): CheckTokenBalanceStep => {
  return {
    type: 'check_token_balance',
    name,
    token,
    address
  };
};

interface CheckTokenBalanceStepRendererProps {
  step: CheckTokenBalanceStep;
}

export const CheckTokenBalanceStepRenderer: React.FC<CheckTokenBalanceStepRendererProps> = ({
  step
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Check Token Balance">
          <TokenIcon fontSize="small" color="secondary" />
        </Tooltip>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          Check Token Balance
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 4, mt: 0.5 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          <span style={{ opacity: 0.7 }}>Token:</span> {step.token}
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          <span style={{ opacity: 0.7 }}>Address:</span> {step.address}
        </Typography>
        {step.result && (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 1, color: 'success.main' }}>
            <span style={{ opacity: 0.7 }}>Balance:</span> {step.result}
          </Typography>
        )}
      </Box>
    </Box>
  );
}; 