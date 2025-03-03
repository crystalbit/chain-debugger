import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  SwapHoriz as TransferIcon,
  Code as TransactionIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { JsonFile, TestCase, Step } from '../types';

interface TestCaseViewerProps {
  file: JsonFile;
  onBack: () => void;
}

export function TestCaseViewer({ file, onBack }: TestCaseViewerProps) {
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestCase = async () => {
      try {
        const content = await window.electronAPI.readFile(file.path);
        const data = JSON.parse(content);
        setTestCase(data);
        setError(null);
      } catch (err) {
        setError('Failed to load test case');
        console.error('Error loading test case:', err);
      }
    };

    loadTestCase();
  }, [file.path]);

  const renderStep = (step: Step) => {
    const isTransfer = step.type === 'transfer';
    
    return (
      <ListItem>
        <ListItemIcon>
          {isTransfer ? <TransferIcon color="primary" /> : <TransactionIcon color="secondary" />}
        </ListItemIcon>
        <ListItemText
          primary={step.name}
          secondary={
            <React.Fragment>
              <Typography component="span" variant="body2" color="text.primary">
                From: {step.from}
              </Typography>
              <br />
              <Typography component="span" variant="body2" color="text.primary">
                To: {step.to}
              </Typography>
              <br />
              {isTransfer ? (
                <Typography component="span" variant="body2" color="text.primary">
                  Value: {step.value}
                </Typography>
              ) : (
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    Signature: {step.signature}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.primary">
                    Arguments: {step.arguments}
                  </Typography>
                </>
              )}
            </React.Fragment>
          }
        />
      </ListItem>
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {file.name.replace(/\.json$/, '')}
          </Typography>
          {file.stepCount !== 'error' && (
            <Chip
              label={`${file.stepCount} ${file.stepCount === 1 ? 'step' : 'steps'}`}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {error ? (
          <Paper elevation={2} sx={{ p: 3, bgcolor: 'error.dark' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : testCase ? (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SettingsIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6" component="div">
                    Configuration
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  RPC URL: {testCase.config.rpcUrl}
                </Typography>
              </CardContent>
            </Card>
            
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Steps
              </Typography>
              <List>
                {testCase.steps.map((step, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    {renderStep(step)}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>Loading...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
} 