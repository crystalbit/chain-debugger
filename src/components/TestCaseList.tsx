import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Box,
  Typography,
  Button,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Error as ErrorIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { JsonFile } from '../types';
import { NewTestCaseDialog } from './dialogs';

interface TestCaseListProps {
  files: JsonFile[];
  onSelect: (file: JsonFile) => void;
  onNewTestCase: (file: JsonFile) => void;
  directory: string;
}

export function TestCaseList({ files, onSelect, onNewTestCase, directory }: TestCaseListProps) {
  const [newTestCaseDialogOpen, setNewTestCaseDialogOpen] = useState(false);

  const handleOpenNewTestCaseDialog = () => {
    setNewTestCaseDialogOpen(true);
  };

  const handleCloseNewTestCaseDialog = () => {
    setNewTestCaseDialogOpen(false);
  };

  const handleTestCaseCreated = (file: JsonFile) => {
    onNewTestCase(file);
  };

  const showCreateButton = !!directory;

  return (
    <Box sx={{ position: 'relative', minHeight: '300px' }}>
      <List sx={{ mt: 2 }}>
        {files.length === 0 ? (
          <Box sx={{ mt: 3, textAlign: 'center', p: 4 }}>
            <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="textSecondary" sx={{ mb: 3 }}>
              {directory ? 'No test cases found in this directory' : 'Please select a directory first'}
            </Typography>
            {showCreateButton && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewTestCaseDialog}
              >
                Create New Test Case
              </Button>
            )}
          </Box>
        ) : (
          files.map((file, index) => (
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
          ))
        )}
      </List>

      {/* Floating Action Button for creating new test case */}
      {files.length > 0 && showCreateButton && (
        <Tooltip title="Create New Test Case">
          <Fab
            color="primary"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            onClick={handleOpenNewTestCaseDialog}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {/* New Test Case Dialog */}
      {directory && (
        <NewTestCaseDialog
          open={newTestCaseDialogOpen}
          onClose={handleCloseNewTestCaseDialog}
          onTestCaseCreated={handleTestCaseCreated}
          directory={directory}
        />
      )}
    </Box>
  );
} 