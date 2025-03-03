import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Box,
  Typography
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { JsonFile } from '../types';

interface TestCaseListProps {
  files: JsonFile[];
  onSelect: (file: JsonFile) => void;
}

export function TestCaseList({ files, onSelect }: TestCaseListProps) {
  if (files.length === 0) {
    return (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography color="textSecondary">
          No test cases found in this directory
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ mt: 2 }}>
      {files.map((file, index) => (
        <React.Fragment key={file.path}>
          {index > 0 && <Divider />}
          <ListItem
            onClick={() => onSelect(file)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(97, 218, 251, 0.08)',
              },
            }}
          >
            <ListItemText
              primary={file.name.replace(/\.json$/, '')}
              primaryTypographyProps={{
                sx: { color: 'primary.main' }
              }}
            />
            <ListItemSecondaryAction>
              {file.stepCount === 'error' ? (
                <Chip
                  icon={<ErrorIcon />}
                  label="Invalid format"
                  color="error"
                  size="small"
                />
              ) : (
                <Chip
                  label={`${file.stepCount} ${file.stepCount === 1 ? 'step' : 'steps'}`}
                  color="primary"
                  size="small"
                />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
} 