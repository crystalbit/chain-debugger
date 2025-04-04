import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { CheckBalanceStep } from '../../../types';

// Create a new Check Balance step
export const createCheckBalanceStep = (
  name: string,
  address: string
): CheckBalanceStep => {
  return {
    type: 'check_balance',
    name,
    address
  };
};

interface CheckBalanceStepRendererProps {
  step: CheckBalanceStep;
}

export const CheckBalanceStepRenderer: React.FC<CheckBalanceStepRendererProps> = ({
  step
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Check Balance">
          <WalletIcon fontSize="small" color="primary" />
        </Tooltip>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          Check Balance
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 4, mt: 0.5 }}>
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