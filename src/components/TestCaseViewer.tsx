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
  Error as ErrorIcon
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
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [expandedTraces, setExpandedTraces] = useState<{ [key: number]: boolean }>({});

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

  // Set up progress listener
  useEffect(() => {
    const unsubscribe = window.electronAPI.onSimulationProgress(({ currentStep }) => {
      setCurrentStepIndex(currentStep);
      // Load intermediate results
      window.electronAPI.readFile(file.path)
        .then(content => {
          const data = JSON.parse(content);
          setTestCase(data);
        })
        .catch(console.error);
    });

    return () => {
      unsubscribe();
    };
  }, [file.path]);

  const handleSimulate = async () => {
    if (!testCase) return;
    
    setIsSimulating(true);
    setCurrentStepIndex(0);
    try {
      // Start simulation
      await window.electronAPI.simulateTestCase(file.path);
      
      // Load final results
      const content = await window.electronAPI.readFile(file.path);
      const data = JSON.parse(content);
      setTestCase(data);
      
      // Auto-expand failed steps
      const newExpandedTraces = { ...expandedTraces };
      data.steps.forEach((step: Step, index: number) => {
        if (step.status === 'failed') {
          newExpandedTraces[index] = true;
        }
      });
      setExpandedTraces(newExpandedTraces);
    } catch (err) {
      setError('Simulation failed');
      console.error('Error during simulation:', err);
    } finally {
      setIsSimulating(false);
      setCurrentStepIndex(-1);
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
    const isExpanded = expandedTraces[index];
    const isCurrentStep = isSimulating && index === currentStepIndex;
    const hasSimulationData = step.status !== undefined;
    
    return (
      <ListItem sx={{
        flexDirection: 'column',
        alignItems: 'stretch',
        bgcolor: hasSimulationData && step.status === 'failed' ? 'error.light' : 'transparent'
      }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', mb: step.trace ? 1 : 0 }}>
          <ListItemIcon>
            {isTransfer ? <TransferIcon color="primary" /> : <TransactionIcon color="secondary" />}
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">{step.name}</Typography>
                {hasSimulationData && step.status && (
                  <Chip
                    size="small"
                    label={step.status}
                    color={getStatusColor(step.status)}
                    icon={step.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                  />
                )}
                {isCurrentStep && (
                  <CircularProgress size={20} />
                )}
              </Box>
            }
            secondary={
              <Box sx={{ mt: 1 }}>
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
              </Box>
            }
          />
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
            startIcon={isSimulating ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
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
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Box>
  );
} 