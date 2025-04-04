import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import { saveEmptyTestCaseFile } from '../steps/utils/FileOperations';
import { JsonFile } from '../../types';

interface NewTestCaseDialogProps {
  open: boolean;
  onClose: () => void;
  onTestCaseCreated: (file: JsonFile) => void;
  directory: string; // Provide directory from parent component
}

export const NewTestCaseDialog: React.FC<NewTestCaseDialogProps> = ({
  open,
  onClose,
  onTestCaseCreated,
  directory
}) => {
  const [fileName, setFileName] = useState('');
  const [rpcUrl, setRpcUrl] = useState('http://localhost:8545');
  const [error, setError] = useState<string | null>(null);

  const handleCreateTestCase = async () => {
    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    try {
      // Save the file
      const filePath = await saveEmptyTestCaseFile(directory, fileName, rpcUrl);

      // Create a JsonFile object to return
      const newFile: JsonFile = {
        name: fileName.endsWith('.json') ? fileName : `${fileName}.json`,
        path: filePath,
        stepCount: 1 // Initial empty step
      };

      // Reset form
      setFileName('');
      setRpcUrl('http://localhost:8545');
      setError(null);

      // Close dialog and notify parent
      onClose();
      onTestCaseCreated(newFile);
    } catch (err) {
      console.error('Error creating test case:', err);
      setError('Failed to create test case file');
    }
  };

  const handleCancel = () => {
    // Reset form
    setFileName('');
    setRpcUrl('http://localhost:8545');
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create New Test Case</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Test Case Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            fullWidth
            required
            placeholder="my_test_case"
            helperText="The name of your test case file (will append .json if not included)"
            autoFocus
          />
          <TextField
            label="Directory"
            value={directory}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            disabled
            helperText="Current working directory"
          />
          <TextField
            label="RPC URL"
            value={rpcUrl}
            onChange={(e) => setRpcUrl(e.target.value)}
            fullWidth
            placeholder="http://localhost:8545"
            helperText="The Ethereum RPC URL to use for this test case"
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button
          onClick={handleCreateTestCase}
          variant="contained"
          color="primary"
          disabled={!fileName.trim()}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 