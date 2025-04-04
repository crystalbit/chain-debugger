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
  Divider,
  Card,
  CardContent,
  Button,
  Alert,
  Tooltip,
  TextField
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { JsonFile, TestCase, Step } from '../types';
import {
  StepRenderer,
  StepActions,
  EditDialog,
  DeleteDialog,
  ConvertDialog,
  clearAllSteps,
  addEmptyStep,
  deleteStep,
  duplicateStep,
  moveStep,
  updateStep
} from './steps';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stepToEdit, setStepToEdit] = useState<{ index: number; step: Step } | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    value: '',
    from: '',
    to: '',
    spender: '',
    amount: '',
    signature: '',
    arguments: '',
    deploymentBytecode: '',
    token: '',
    seconds: '',
  });
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [stepToConvert, setStepToConvert] = useState<number | null>(null);
  const [newStepType, setNewStepType] = useState<'set_balance' | 'transfer' | 'approve' | 'transaction' | 'deploy_contract' | 'check_balance' | 'check_token_balance' | 'wait' | null>(null);
  const [isEditingRpcUrl, setIsEditingRpcUrl] = useState(false);
  const [newRpcUrl, setNewRpcUrl] = useState('');

  // Add listener for step completion events
  useEffect(() => {
    const handleStepComplete = (_event: any, data: { index: number; status: 'success' | 'failed'; step: Step }) => {
      setTestCase(prev => {
        if (!prev) return prev;
        const newSteps = [...prev.steps];
        newSteps[data.index] = { ...data.step };
        return { ...prev, steps: newSteps };
      });

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
        steps: clearAllSteps(testCase.steps)
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

  const handleAddEmptyStep = async (index: number) => {
    if (!testCase) return;

    const updatedTestCase = addEmptyStep(testCase, index);
    setTestCase(updatedTestCase);

    // Update file's step count
    file.stepCount = updatedTestCase.steps.length;

    // Save the updated test case to file
    try {
      await window.electronAPI.writeFile(file.path, JSON.stringify(updatedTestCase, null, 2));
    } catch (err) {
      console.error('Error saving test case:', err);
      setError('Failed to save test case');
    }
  };

  const handleDeleteStep = async (index: number) => {
    if (!testCase) return;

    const updatedTestCase = deleteStep(testCase, index);
    setTestCase(updatedTestCase);

    // Update file's step count
    file.stepCount = updatedTestCase.steps.length;

    // Save the updated test case to file
    try {
      await window.electronAPI.writeFile(file.path, JSON.stringify(updatedTestCase, null, 2));
    } catch (err) {
      console.error('Error saving test case:', err);
      setError('Failed to save test case');
    }

    setDeleteDialogOpen(false);
    setStepToDelete(null);
  };

  const openDeleteDialog = (index: number) => {
    setStepToDelete(index);
    setDeleteDialogOpen(true);
  };

  const handleDuplicateStep = async (index: number) => {
    if (!testCase) return;

    const updatedTestCase = duplicateStep(testCase, index);
    setTestCase(updatedTestCase);

    // Update file's step count
    file.stepCount = updatedTestCase.steps.length;

    // Save the updated test case to file
    try {
      await window.electronAPI.writeFile(file.path, JSON.stringify(updatedTestCase, null, 2));
    } catch (err) {
      console.error('Error saving test case:', err);
      setError('Failed to save test case');
    }
  };

  const handleMoveStep = async (fromIndex: number, toIndex: number) => {
    if (!testCase) return;

    const updatedTestCase = moveStep(testCase, fromIndex, toIndex);
    setTestCase(updatedTestCase);

    // Save the updated test case to file
    try {
      await window.electronAPI.writeFile(file.path, JSON.stringify(updatedTestCase, null, 2));
    } catch (err) {
      console.error('Error saving test case:', err);
      setError('Failed to save test case');
    }
  };

  const handleConvertStep = async (index: number) => {
    if (!testCase) return;
    setStepToConvert(index);
    setConvertDialogOpen(true);
  };

  const handleEditStep = async (index: number) => {
    if (!testCase) return;

    const step = testCase.steps[index];
    if (!['set_balance', 'transfer', 'approve', 'transaction', 'deploy_contract', 'check_balance', 'check_token_balance', 'wait'].includes(step.type)) return;

    setStepToEdit({ index, step });
    setEditForm({
      name: step.name,
      address: step.type === 'set_balance' || step.type === 'check_balance' || step.type === 'check_token_balance' ? step.address : '',
      value: step.type === 'set_balance' || step.type === 'transfer' ? step.value : '',
      from: step.type === 'transfer' || step.type === 'approve' || step.type === 'transaction' || step.type === 'deploy_contract' ? step.from : '',
      to: step.type === 'transfer' || step.type === 'approve' || step.type === 'transaction' || step.type === 'deploy_contract' ? step.to : '',
      spender: step.type === 'approve' ? step.spender : '',
      amount: step.type === 'approve' ? step.amount : '',
      signature: step.type === 'transaction' ? step.signature : '',
      arguments: step.type === 'transaction' ? step.arguments : '',
      deploymentBytecode: step.type === 'deploy_contract' ? step.deploymentBytecode : '',
      token: step.type === 'check_token_balance' ? step.token : '',
      seconds: step.type === 'wait' ? step.seconds : '',
    });
    setEditDialogOpen(true);
  };

  const handleStepTypeSelect = (type: 'set_balance' | 'transfer' | 'approve' | 'transaction' | 'deploy_contract' | 'check_balance' | 'check_token_balance' | 'wait') => {
    if (!testCase || stepToConvert === null) return;

    const step = testCase.steps[stepToConvert];
    if (step.type !== 'empty') return;

    setNewStepType(type);
    setStepToEdit({ index: stepToConvert, step });

    // Set up the edit form with default values for the new step type
    setEditForm({
      name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Step`,
      address: '',
      value: '',
      from: '',
      to: '',
      spender: '',
      amount: '',
      signature: '',
      arguments: '',
      deploymentBytecode: '',
      token: '',
      seconds: '',
    });

    setConvertDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!testCase || !stepToEdit) return;

    const updatedTestCase = updateStep(testCase, stepToEdit.index, {
      name: editForm.name,
      type: newStepType || stepToEdit.step.type as any,
      address: editForm.address,
      value: editForm.value,
      from: editForm.from,
      to: editForm.to,
      spender: editForm.spender,
      amount: editForm.amount,
      signature: editForm.signature,
      arguments: editForm.arguments,
      deploymentBytecode: editForm.deploymentBytecode,
      token: editForm.token,
      seconds: editForm.seconds,
    });

    setTestCase(updatedTestCase);

    // Save the updated test case to file
    try {
      await window.electronAPI.writeFile(file.path, JSON.stringify(updatedTestCase, null, 2));
    } catch (err) {
      console.error('Error saving test case:', err);
      setError('Failed to save test case');
    }

    setEditDialogOpen(false);
    setStepToEdit(null);
    setNewStepType(null);
    setStepToConvert(null);
  };

  const handleSaveRpcUrl = async () => {
    if (!testCase) return;

    try {
      // Update the test case with the new RPC URL
      const updatedTestCase = {
        ...testCase,
        config: {
          ...testCase.config,
          rpcUrl: newRpcUrl
        }
      };

      setTestCase(updatedTestCase);

      // Save the updated test case to file
      await window.electronAPI.writeFile(file.path, JSON.stringify(updatedTestCase, null, 2));

      setIsEditingRpcUrl(false);
      setError(null);
    } catch (err) {
      console.error('Error saving RPC URL:', err);
      setError('Failed to save RPC URL');
    }
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    RPC URL:
                  </Typography>
                  {isEditingRpcUrl ? (
                    <>
                      <TextField
                        size="small"
                        value={newRpcUrl}
                        onChange={(e) => setNewRpcUrl(e.target.value)}
                        sx={{ flexGrow: 1, mr: 1 }}
                      />
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={handleSaveRpcUrl}
                        title="Save"
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setIsEditingRpcUrl(false)}
                        title="Cancel"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {testCase.config.rpcUrl}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setNewRpcUrl(testCase.config.rpcUrl);
                          setIsEditingRpcUrl(true);
                        }}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Steps
              </Typography>
              <List>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                  <Tooltip title="Add empty step">
                    <IconButton
                      size="small"
                      onClick={() => handleAddEmptyStep(0)}
                      sx={{
                        opacity: 0.5,
                        '&:hover': { opacity: 1 },
                        transform: 'scale(0.8)'
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                {testCase.steps.map((step, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <StepRenderer
                          step={step}
                          index={index}
                          isExpanded={expandedTraces[index]}
                          processingStep={processingStep}
                          toggleTrace={toggleTrace}
                        />
                      </Box>
                      <StepActions
                        step={step}
                        index={index}
                        stepsLength={testCase.steps.length}
                        onAddEmptyStep={handleAddEmptyStep}
                        onDeleteStep={openDeleteDialog}
                        onDuplicateStep={handleDuplicateStep}
                        onMoveStep={handleMoveStep}
                        onEditStep={handleEditStep}
                        onConvertStep={handleConvertStep}
                      />
                    </Box>
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

      {/* Dialogs */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={() => stepToDelete !== null && handleDeleteStep(stepToDelete)}
      />

      <EditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        stepToEdit={stepToEdit}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        newStepType={newStepType}
      />

      <ConvertDialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
        onSelectType={handleStepTypeSelect}
      />
    </Box>
  );
} 