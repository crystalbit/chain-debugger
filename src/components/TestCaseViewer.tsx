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
  CardContent,
  Button,
  CircularProgress,
  Collapse,
  Alert
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  SwapHoriz as TransferIcon,
  Code as TransactionIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  AccountBalance as SetBalanceIcon,
  VerifiedUser as ApproveIcon
} from '@mui/icons-material';
import { JsonFile, TestCase, Step } from '../types';

interface TestCaseViewerProps {
  file: JsonFile;
  onBack: () => void;
}

export function TestCaseViewer({ file, onBack }: TestCaseViewerProps) {
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [expandedTraces, setExpandedTraces] = useState<{ [key: number]: boolean }>({});
  const [processingStep, setProcessingStep] = useState<number | null>(null);

  // Add listener for step completion events
  useEffect(() => {
    const handleStepComplete = (_event: any, data: { index: number; status: 'success' | 'failed'; step: Step }) => {
      setTestCase(prev => {
        if (!prev) return prev;
        const newSteps = [...prev.steps];
        newSteps[data.index] = { ...data.step };
        return { ...prev, steps: newSteps };
      });

      // Auto-expand failed steps
      if (data.status === 'failed') {
        setExpandedTraces(prev => ({
          ...prev,
          [data.index]: true
        }));
      }
      setProcessingStep(data.index + 1);
    };

    // Subscribe to step-complete events
    window.electronAPI.onStepComplete(handleStepComplete);

    // Cleanup listener
    return () => {
      window.electronAPI.removeStepCompleteListener(handleStepComplete);
    };
  }, []);

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

  const handleSimulate = async () => {
    if (!testCase) return;
    
    setIsSimulating(true);
    setError(null); // Clear any previous errors
    setProcessingStep(0);
    
    try {
      // Clear all statuses and traces
      const cleanedTestCase = {
        ...testCase,
        steps: testCase.steps.map(step => ({
          ...step,
          status: undefined,
          trace: undefined,
          result: undefined
        }))
      };
      setTestCase(cleanedTestCase);

      // Start simulation
      const result = await window.electronAPI.simulateTestCase(file.path);

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSimulating(false);
      setProcessingStep(null); // Clear processing step when simulation is complete
    }
  };

  const toggleTrace = (index: number) => {
    setExpandedTraces(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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

  const renderStep = (step: Step, index: number) => {
    const isTransfer = step.type === 'transfer';
    const isApprove = step.type === 'approve';
    const isSetBalance = step.type === 'set_balance';
    const isExpanded = expandedTraces[index];
    const hasSimulationData = step.status !== undefined;
    const isProcessing = processingStep === index;
    
    return (
      <ListItem sx={{
        flexDirection: 'column',
        alignItems: 'stretch',
        bgcolor: hasSimulationData && step.status === 'failed' ? 'error.light' : 'transparent'
      }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', mb: step.trace ? 1 : 0 }}>
          <ListItemIcon>
            {isTransfer ? (
              <TransferIcon color="primary" />
            ) : isApprove ? (
              <ApproveIcon color="warning" />
            ) : isSetBalance ? (
              <SetBalanceIcon color="success" sx={{ fontSize: '1.5rem' }} />
            ) : (
              <TransactionIcon color="info" />
            )}
          </ListItemIcon>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1">{step.name}</Typography>
              {isProcessing ? (
                <CircularProgress size={16} />
              ) : hasSimulationData && step.status && (
                <Chip
                  size="small"
                  label={step.status}
                  color={getStatusColor(step.status)}
                  icon={step.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                />
              )}
            </Box>
            <Box sx={{ mt: 1 }}>
              {step.type === "set_balance" ? (
                <>
                  <Typography component="div" variant="body2" color="text.primary">
                    Address: {step.address}
                  </Typography>
                  <Typography component="div" variant="body2" color="text.primary">
                    Value: {step.value}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography component="div" variant="body2" color="text.primary">
                    From: {step.from}
                  </Typography>
                  <Typography component="div" variant="body2" color="text.primary">
                    To: {step.to}
                  </Typography>
                  {isTransfer ? (
                    <Typography component="div" variant="body2" color="text.primary">
                      Value: {step.value}
                    </Typography>
                  ) : isApprove ? (
                    <>
                      <Typography component="div" variant="body2" color="text.primary">
                        Spender: {step.spender}
                      </Typography>
                      <Typography component="div" variant="body2" color="text.primary">
                        Amount: {step.amount}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography component="div" variant="body2" color="text.primary">
                        Signature: {step.signature}
                      </Typography>
                      <Typography component="div" variant="body2" color="text.primary">
                        Arguments: {step.arguments}
                      </Typography>
                    </>
                  )}
                </>
              )}
            </Box>
          </Box>
          {hasSimulationData && step.trace && (
            <IconButton onClick={() => toggleTrace(index)} sx={{ mt: 1 }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {hasSimulationData && (step.trace || step.result) && (
          <Collapse in={isExpanded} sx={{ width: '100%' }}>
            <Box sx={{ pl: 7, pr: 2, pb: 2 }}>
              {step.result && (
                <Alert severity="error" sx={{ mb: 2 }}>
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
                    overflow: 'auto'
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
                      m: 0
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
              sx={{ mr: 2 }}
            />
          )}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayIcon />}
            onClick={handleSimulate}
            disabled={isSimulating || !testCase}
          >
            {isSimulating ? 'Simulating...' : 'Simulate'}
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
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
                    {renderStep(step, index)}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>Loading test case...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
} 