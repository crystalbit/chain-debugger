import React from 'react';
import {
  Box,
  Typography,
  ListItem,
  Chip,
  IconButton,
  Collapse,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Step } from '../../types';
import {
  EmptyStepRenderer,
  SetBalanceStepRenderer,
  TransferStepRenderer,
  ApproveStepRenderer,
  TransactionStepRenderer,
  DeployContractStepRenderer,
  CheckBalanceStepRenderer,
  CheckTokenBalanceStepRenderer
} from './types';

interface StepRendererProps {
  step: Step;
  index: number;
  isExpanded: boolean;
  processingStep: number | null;
  toggleTrace: (index: number) => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  step,
  index,
  isExpanded,
  processingStep,
  toggleTrace,
}) => {
  const isEmpty = step.type === 'empty';
  const hasSimulationData = !isEmpty && step.status !== undefined;
  const isProcessing = !isEmpty && processingStep === index;
  const hasTrace = !isEmpty && 'trace' in step && step.trace;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render step content based on step type
  const renderStepContent = () => {
    switch (step.type) {
      case 'empty':
        return <EmptyStepRenderer step={step} />;
      case 'set_balance':
        return <SetBalanceStepRenderer step={step} />;
      case 'transfer':
        return <TransferStepRenderer step={step} />;
      case 'approve':
        return <ApproveStepRenderer step={step} />;
      case 'transaction':
        return <TransactionStepRenderer step={step} />;
      case 'deploy_contract':
        return <DeployContractStepRenderer step={step} />;
      case 'check_balance':
        return <CheckBalanceStepRenderer step={step} />;
      case 'check_token_balance':
        return <CheckTokenBalanceStepRenderer step={step} />;
      default:
        return <Typography variant="body2">Unknown step type</Typography>;
    }
  };

  return (
    <ListItem sx={{
      flexDirection: 'column',
      alignItems: 'stretch',
      bgcolor: (hasSimulationData || hasTrace) && step.status === 'failed' ? 'error.light' : 'transparent'
    }}>
      <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', mb: hasTrace ? 1 : 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                cursor: (hasSimulationData || hasTrace) ? 'pointer' : 'default',
                '&:hover': (hasSimulationData || hasTrace) ? { textDecoration: 'underline' } : {}
              }}
              onClick={(hasSimulationData || hasTrace) ? () => toggleTrace(index) : undefined}
            >
              {step.name}
            </Typography>
            {isProcessing && <CircularProgress size={16} />}
            {'status' in step && step.status && (
              <Chip
                size="small"
                label={step.status}
                color={getStatusColor(step.status)}
                icon={step.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
              />
            )}
          </Box>
          <Box>
            {renderStepContent()}
          </Box>
        </Box>
        {(hasSimulationData || hasTrace) && (
          <IconButton onClick={() => toggleTrace(index)} sx={{ mt: 1 }}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      {(hasSimulationData || hasTrace) && (step.trace || step.result) && (
        <Collapse in={isExpanded} sx={{ width: '100%' }}>
          <Box sx={{ pl: 7, pr: 2, pb: 2, width: '100%', overflow: 'hidden' }}>
            {step.result && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  width: '100%',
                  '& .MuiAlert-message': {
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    overflowWrap: 'break-word'
                  }
                }}
              >
                {step.result}
              </Alert>
            )}
            {step.trace && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'grey.900',
                  maxHeight: '400px',
                  overflow: 'auto',
                  width: '100%'
                }}
              >
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: 'common.white',
                    m: 0,
                    width: '100%',
                    overflow: 'hidden'
                  }}
                >
                  {step.trace}
                </Typography>
              </Paper>
            )}
          </Box>
        </Collapse>
      )}
    </ListItem>
  );
}; 