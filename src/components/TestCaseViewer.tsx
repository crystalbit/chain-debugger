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
import { JsonFile, TestCase, Step, EmptyStep, SetBalanceStep } from '../types';

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
    arguments: ''
  });
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [stepToConvert, setStepToConvert] = useState<number | null>(null);
  const [newStepType, setNewStepType] = useState<'set_balance' | 'transfer' | 'approve' | 'transaction' | null>(null);

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

  const clearAllSteps = (steps: Step[]): Step[] => {
    return steps.map(step => ({
      ...step,
      status: undefined,
      trace: undefined,
      result: undefined
    }));
  };

  const handleAddEmptyStep = async (index: number) => {
    if (!testCase) return;

    const newStep: EmptyStep = {
      type: 'empty',
      name: `Empty Step ${testCase.steps.length + 1}`
    };

    const newSteps = [...testCase.steps];
    newSteps.splice(index, 0, newStep);

    const updatedTestCase = {
      ...testCase,
      steps: newSteps
    };

    setTestCase(updatedTestCase);

    // Update file's step count
    file.stepCount = newSteps.length;

    // Save the updated test case to file
    try {
      await window.electronAPI.writeFile(file.path, JSON.stringify(updatedTestCase, null, 2));
    } catch (err) {
      console.error('Error saving test case:', err);
      // Optionally show an error message to the user
      setError('Failed to save test case');
    }
  };

  const handleDeleteStep = async (index: number) => {
    if (!testCase) return;

    const newSteps = [...testCase.steps];
    newSteps.splice(index, 1);

    const updatedTestCase = {
      ...testCase,
      steps: clearAllSteps(newSteps)
    };

    setTestCase(updatedTestCase);

    // Update file's step count
    file.stepCount = newSteps.length;

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

    const stepToDuplicate = testCase.steps[index];
    const newStep = {
      ...stepToDuplicate,
      name: `${stepToDuplicate.name} (Copy)`
    };

    const newSteps = [...testCase.steps];
    newSteps.splice(index + 1, 0, newStep);

    const updatedTestCase = {
      ...testCase,
      steps: clearAllSteps(newSteps)
    };

    setTestCase(updatedTestCase);

    // Update file's step count
    file.stepCount = newSteps.length;

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

    const newSteps = [...testCase.steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);

    const updatedTestCase = {
      ...testCase,
      steps: clearAllSteps(newSteps)
    };

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
    if (!['set_balance', 'transfer', 'approve', 'transaction'].includes(step.type)) return;

    setStepToEdit({ index, step });
    setEditForm({
      name: step.name,
      address: step.type === 'set_balance' ? step.address : '',
      value: step.type === 'set_balance' ? step.value : '',
      from: step.type === 'transfer' || step.type === 'approve' || step.type === 'transaction' ? step.from : '',
      to: step.type === 'transfer' || step.type === 'approve' || step.type === 'transaction' ? step.to : '',
      spender: step.type === 'approve' ? step.spender : '',
      amount: step.type === 'approve' ? step.amount : '',
      signature: step.type === 'transaction' ? step.signature : '',
      arguments: step.type === 'transaction' ? step.arguments : ''
    });
    setEditDialogOpen(true);
  };

  const handleStepTypeSelect = (type: 'set_balance' | 'transfer' | 'approve' | 'transaction') => {
    if (!testCase || stepToConvert === null) return;

    const step = testCase.steps[stepToConvert];
    if (step.type !== 'empty') return;

    setNewStepType(type);
    setStepToEdit({ index: stepToConvert, step });
    
    // Set up the edit form with default values for the new step type
    setEditForm({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
      address: '',
      value: '',
      from: '',
      to: '',
      spender: '',
      amount: '',
      signature: '',
      arguments: ''
    });

    setConvertDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!testCase || !stepToEdit) return;

    const newSteps = [...testCase.steps];
    let updatedStep: Step;

    // If this is a conversion from empty step
    if (stepToEdit.step.type === 'empty' && newStepType) {
      switch (newStepType) {
        case 'set_balance':
          updatedStep = {
            type: 'set_balance',
            name: editForm.name,
            address: editForm.address,
            value: editForm.value
          };
          break;
        case 'transfer':
          updatedStep = {
            type: 'transfer',
            name: editForm.name,
            from: editForm.from,
            to: editForm.to,
            value: editForm.value
          };
          break;
        case 'approve':
          updatedStep = {
            type: 'approve',
            name: editForm.name,
            from: editForm.from,
            to: editForm.to,
            spender: editForm.spender,
            amount: editForm.amount
          };
          break;
        case 'transaction':
          updatedStep = {
            type: 'transaction',
            name: editForm.name,
            from: editForm.from,
            to: editForm.to,
            signature: editForm.signature,
            arguments: editForm.arguments
          };
          break;
        default:
          return;
      }
    } else {
      // Regular edit logic
      switch (stepToEdit.step.type) {
        case 'set_balance':
          updatedStep = {
            ...stepToEdit.step,
            name: editForm.name,
            address: editForm.address,
            value: editForm.value
          } as SetBalanceStep;
          break;
        case 'transfer':
          updatedStep = {
            ...stepToEdit.step,
            name: editForm.name,
            from: editForm.from,
            to: editForm.to,
            value: editForm.value
          };
          break;
        case 'approve':
          updatedStep = {
            ...stepToEdit.step,
            name: editForm.name,
            from: editForm.from,
            to: editForm.to,
            spender: editForm.spender,
            amount: editForm.amount
          };
          break;
        case 'transaction':
          updatedStep = {
            ...stepToEdit.step,
            name: editForm.name,
            from: editForm.from,
            to: editForm.to,
            signature: editForm.signature,
            arguments: editForm.arguments
          };
          break;
        default:
          return;
      }
    }

    newSteps[stepToEdit.index] = updatedStep;

    const updatedTestCase = {
      ...testCase,
      steps: clearAllSteps(newSteps)
    };

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

  const renderStep = (step: Step, index: number) => {
    const isTransfer = step.type === 'transfer';
    const isApprove = step.type === 'approve';
    const isSetBalance = step.type === 'set_balance';
    const isEmpty = step.type === 'empty';
    const isExpanded = expandedTraces[index];
    const hasSimulationData = !isEmpty && step.status !== undefined;
    const isProcessing = !isEmpty && processingStep === index;
    const hasTrace = !isEmpty && 'trace' in step && step.trace;
    
    return (
      <ListItem sx={{
        flexDirection: 'column',
        alignItems: 'stretch',
        bgcolor: hasSimulationData && step.status === 'failed' ? 'error.light' : 'transparent'
      }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', mb: hasTrace ? 1 : 0 }}>
          <ListItemIcon>
            {isTransfer ? (
              <TransferIcon color="primary" />
            ) : isApprove ? (
              <ApproveIcon color="warning" />
            ) : isSetBalance ? (
              <SetBalanceIcon color="success" sx={{ fontSize: '1.5rem' }} />
            ) : isEmpty ? (
              <CheckCircleIcon color="disabled" />
            ) : (
              <TransactionIcon color="info" />
            )}
          </ListItemIcon>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1">{step.name}</Typography>
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
              ) : step.type === "empty" ? (
                <Typography component="div" variant="body2" color="text.secondary">
                  Empty step
                </Typography>
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
          {hasSimulationData && hasTrace && (
            <IconButton onClick={() => toggleTrace(index)} sx={{ mt: 1 }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {hasSimulationData && (step.trace || step.result) && (
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

  const renderEditDialog = () => {
    if (!stepToEdit) return null;

    const stepType = newStepType || stepToEdit.step.type;
    const title = `Edit ${stepType.charAt(0).toUpperCase() + stepType.slice(1)} Step`;

    return (
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            {stepType === 'set_balance' && (
              <>
                <TextField
                  label="Address"
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Value"
                  value={editForm.value}
                  onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                  fullWidth
                />
              </>
            )}
            {stepType === 'transfer' && (
              <>
                <TextField
                  label="From"
                  value={editForm.from}
                  onChange={(e) => setEditForm(prev => ({ ...prev, from: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="To"
                  value={editForm.to}
                  onChange={(e) => setEditForm(prev => ({ ...prev, to: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Value"
                  value={editForm.value}
                  onChange={(e) => setEditForm(prev => ({ ...prev, value: e.target.value }))}
                  fullWidth
                />
              </>
            )}
            {stepType === 'approve' && (
              <>
                <TextField
                  label="From"
                  value={editForm.from}
                  onChange={(e) => setEditForm(prev => ({ ...prev, from: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="To"
                  value={editForm.to}
                  onChange={(e) => setEditForm(prev => ({ ...prev, to: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Spender"
                  value={editForm.spender}
                  onChange={(e) => setEditForm(prev => ({ ...prev, spender: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Amount"
                  value={editForm.amount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                  fullWidth
                />
              </>
            )}
            {stepType === 'transaction' && (
              <>
                <TextField
                  label="From"
                  value={editForm.from}
                  onChange={(e) => setEditForm(prev => ({ ...prev, from: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="To"
                  value={editForm.to}
                  onChange={(e) => setEditForm(prev => ({ ...prev, to: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Signature"
                  value={editForm.signature}
                  onChange={(e) => setEditForm(prev => ({ ...prev, signature: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Arguments"
                  value={editForm.arguments}
                  onChange={(e) => setEditForm(prev => ({ ...prev, arguments: e.target.value }))}
                  fullWidth
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
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
                        {renderStep(step, index)}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, alignItems: 'center' }}>
                        {/* First row - Add and Duplicate */}
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Add empty step">
                            <IconButton 
                              size="small" 
                              onClick={() => handleAddEmptyStep(index + 1)}
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
                              onClick={() => handleDuplicateStep(index)}
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
                              onClick={() => handleMoveStep(index, index - 1)}
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
                              onClick={() => handleMoveStep(index, index + 1)}
                              disabled={index === testCase.steps.length - 1}
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
                                onClick={() => handleConvertStep(index)}
                                sx={{ 
                                  opacity: 0.5,
                                  '&:hover': { opacity: 1 },
                                  transform: 'scale(0.8)'
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : ['set_balance', 'transfer', 'approve', 'transaction'].includes(step.type) && (
                            <Tooltip title="Edit step">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditStep(index)}
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
                              onClick={() => openDeleteDialog(index)}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Step</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this step? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => stepToDelete !== null && handleDeleteStep(stepToDelete)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {renderEditDialog()}

      <Dialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Convert Empty Step</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Select the type of step to convert to:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => handleStepTypeSelect('set_balance')}
              startIcon={<SetBalanceIcon />}
            >
              Set Balance
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleStepTypeSelect('transfer')}
              startIcon={<TransferIcon />}
            >
              Transfer
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleStepTypeSelect('approve')}
              startIcon={<ApproveIcon />}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleStepTypeSelect('transaction')}
              startIcon={<TransactionIcon />}
            >
              Transaction
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 