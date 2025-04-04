import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Button
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  Code as TransactionIcon,
  AccountBalance as SetBalanceIcon,
  VerifiedUser as ApproveIcon,
  Code as DeployContractIcon,
  AccountBalanceWallet as CheckBalanceIcon,
  Token as CheckTokenBalanceIcon
} from '@mui/icons-material';
import { Step } from '../../types';

interface EditFormState {
  name: string;
  address: string;
  value: string;
  from: string;
  to: string;
  spender: string;
  amount: string;
  signature: string;
  arguments: string;
  deploymentBytecode: string;
  token: string;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  stepToEdit: { index: number; step: Step } | null;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  onSave: () => void;
  newStepType: 'set_balance' | 'transfer' | 'approve' | 'transaction' | 'deploy_contract' | 'check_balance' | 'check_token_balance' | null;
}

export const EditDialog: React.FC<EditDialogProps> = ({
  open,
  onClose,
  stepToEdit,
  editForm,
  setEditForm,
  onSave,
  newStepType
}) => {
  if (!stepToEdit) return null;

  const stepType = newStepType || stepToEdit.step.type;
  const title = `Edit ${stepType.charAt(0).toUpperCase() + stepType.slice(1).replace('_', ' ')} Step`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          {stepType === 'deploy_contract' && (
            <>
              <TextField
                label="From"
                value={editForm.from}
                onChange={(e) => setEditForm(prev => ({ ...prev, from: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Deployment Bytecode"
                value={editForm.deploymentBytecode}
                onChange={(e) => setEditForm(prev => ({ ...prev, deploymentBytecode: e.target.value }))}
                fullWidth
                multiline
                rows={4}
              />
            </>
          )}
          {stepType === 'check_balance' && (
            <>
              <TextField
                label="Address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                fullWidth
              />
            </>
          )}
          {stepType === 'check_token_balance' && (
            <>
              <TextField
                label="Token"
                value={editForm.token}
                onChange={(e) => setEditForm(prev => ({ ...prev, token: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                fullWidth
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onDelete
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Delete Step</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this step? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onDelete}
          color="error"
          variant="contained"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface ConvertDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: 'set_balance' | 'transfer' | 'approve' | 'transaction' | 'deploy_contract' | 'check_balance' | 'check_token_balance') => void;
}

export const ConvertDialog: React.FC<ConvertDialogProps> = ({
  open,
  onClose,
  onSelectType
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            onClick={() => onSelectType('set_balance')}
            startIcon={<SetBalanceIcon />}
          >
            Set Balance
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSelectType('transfer')}
            startIcon={<TransferIcon />}
          >
            Transfer
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSelectType('approve')}
            startIcon={<ApproveIcon />}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSelectType('transaction')}
            startIcon={<TransactionIcon />}
          >
            Transaction
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSelectType('deploy_contract')}
            startIcon={<DeployContractIcon />}
          >
            Deploy Contract
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSelectType('check_balance')}
            startIcon={<CheckBalanceIcon />}
          >
            Check Balance
          </Button>
          <Button
            variant="outlined"
            onClick={() => onSelectType('check_token_balance')}
            startIcon={<CheckTokenBalanceIcon />}
          >
            Check Token Balance
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}; 