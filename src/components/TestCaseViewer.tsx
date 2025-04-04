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
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
  VerifiedUser as ApproveIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  Edit as EditIcon
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
    deploymentBytecode: ''
  });
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [stepToConvert, setStepToConvert] = useState<number | null>(null);
  const [newStepType, setNewStepType] = useState<'set_balance' | 'transfer' | 'approve' | 'transaction' | 'deploy_contract' | null>(null);

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
    // Don't allow editing empty steps
    if (step.type === 'empty') return;
    if (!['set_balance', 'transfer', 'approve', 'transaction', 'deploy_contract'].includes(step.type)) return;

    setStepToEdit({ index, step });
    setEditForm({
      name: step.name,
      address: step.type === 'set_balance' ? step.address : '',
      value: step.type === 'set_balance' || step.type === 'transfer' ? step.value : '',
      from: step.type === 'transfer' || step.type === 'approve' || step.type === 'transaction' || step.type === 'deploy_contract' ? step.from : '',
      to: step.type === 'transfer' || step.type === 'approve' || step.type === 'transaction' || step.type === 'deploy_contract' ? step.to : '',
      spender: step.type === 'approve' ? step.spender : '',
      amount: step.type === 'approve' ? step.amount : '',
      signature: step.type === 'transaction' ? step.signature : '',
      arguments: step.type === 'transaction' ? step.arguments : '',
      deploymentBytecode: step.type === 'deploy_contract' ? step.deploymentBytecode : ''
    });
    setEditDialogOpen(true);
  };

  const handleStepTypeSelect = (type: 'set_balance' | 'transfer' | 'approve' | 'transaction' | 'deploy_contract') => {
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
      deploymentBytecode: ''
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
      deploymentBytecode: editForm.deploymentBytecode
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