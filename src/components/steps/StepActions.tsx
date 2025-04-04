import React from 'react';
import {
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Step } from '../../types';

interface StepActionsProps {
  step: Step;
  index: number;
  stepsLength: number;
  onAddEmptyStep: (index: number) => void;
  onDeleteStep: (index: number) => void;
  onDuplicateStep: (index: number) => void;
  onMoveStep: (fromIndex: number, toIndex: number) => void;
  onEditStep: (index: number) => void;
  onConvertStep: (index: number) => void;
}

export const StepActions: React.FC<StepActionsProps> = ({
  step,
  index,
  stepsLength,
  onAddEmptyStep,
  onDeleteStep,
  onDuplicateStep,
  onMoveStep,
  onEditStep,
  onConvertStep
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, alignItems: 'center' }}>
      {/* First row - Add and Duplicate */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <Tooltip title="Add empty step">
          <IconButton
            size="small"
            onClick={() => onAddEmptyStep(index + 1)}
            sx={{
              opacity: 0.5,
              '&:hover': { opacity: 1 },
              transform: 'scale(0.8)'
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Duplicate step">
          <IconButton
            size="small"
            onClick={() => onDuplicateStep(index)}
            sx={{
              opacity: 0.5,
              '&:hover': { opacity: 1 },
              transform: 'scale(0.8)'
            }}
          >
            <DuplicateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Second row - Move Up/Down */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <Tooltip title="Move up">
          <IconButton
            size="small"
            onClick={() => onMoveStep(index, index - 1)}
            disabled={index === 0}
            sx={{
              opacity: 0.5,
              '&:hover': { opacity: 1 },
              transform: 'scale(0.8)'
            }}
          >
            <MoveUpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Move down">
          <IconButton
            size="small"
            onClick={() => onMoveStep(index, index + 1)}
            disabled={index === stepsLength - 1}
            sx={{
              opacity: 0.5,
              '&:hover': { opacity: 1 },
              transform: 'scale(0.8)'
            }}
          >
            <MoveDownIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Third row - Edit/Convert and Delete */}
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        {step.type === 'empty' ? (
          <Tooltip title="Convert step">
            <IconButton
              size="small"
              onClick={() => onConvertStep(index)}
              sx={{
                opacity: 0.5,
                '&:hover': { opacity: 1 },
                transform: 'scale(0.8)'
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : ['set_balance', 'transfer', 'approve', 'transaction', 'deploy_contract', 'check_balance', 'check_token_balance'].includes(step.type) && (
          <Tooltip title="Edit step">
            <IconButton
              size="small"
              onClick={() => onEditStep(index)}
              sx={{
                opacity: 0.5,
                '&:hover': { opacity: 1 },
                transform: 'scale(0.8)'
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Delete step">
          <IconButton
            size="small"
            onClick={() => onDeleteStep(index)}
            sx={{
              opacity: 0.5,
              '&:hover': { opacity: 1 },
              transform: 'scale(0.8)',
              color: 'error.main'
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}; 