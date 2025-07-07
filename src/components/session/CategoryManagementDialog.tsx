import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';
import { StorageService } from '../../utils/storage';
import type { OpportunityCategory, User, Opportunity } from '../../types';

interface CategoryManagementDialogProps {
  open: boolean;
  onClose: () => void;
  category: OpportunityCategory | null;
  onSave: (updatedCategory: OpportunityCategory) => void;
  opportunities: Opportunity[];
}

export const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  open,
  onClose,
  category,
  onSave,
  opportunities
}) => {
  const { participants, session } = useSession();
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [selectedDeciderId, setSelectedDeciderId] = useState<string>('');
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<Set<string>>(new Set());
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    if (category && open) {
      setEditedName(category.name);
      setEditedDescription(category.description);
      setSelectedDeciderId(category.assignedDeciderId || '');
      setSelectedOpportunityIds(new Set(category.opportunityIds));
      setApprovalNotes(category.deciderNotes || '');
    }
  }, [category, open]);

  const handleSave = () => {
    if (!category || !session) return;

    const updatedCategory: OpportunityCategory = {
      ...category,
      name: editedName.trim(),
      description: editedDescription.trim(),
      assignedDeciderId: selectedDeciderId || undefined,
      opportunityIds: Array.from(selectedOpportunityIds),
      deciderNotes: approvalNotes.trim() || undefined,
      approvalStatus: selectedDeciderId ? 'pending' : category.approvalStatus
    };

    // Save to storage
    StorageService.updateCategory(session.id, category.id, updatedCategory);
    
    // Notify parent
    onSave(updatedCategory);
    onClose();
  };

  const toggleOpportunity = (oppId: string) => {
    setSelectedOpportunityIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(oppId)) {
        newSet.delete(oppId);
      } else {
        newSet.add(oppId);
      }
      return newSet;
    });
  };

  const getDeciderCandidates = (): User[] => {
    // Filter to show users who have submitted opportunities (likely engaged participants)
    return participants.filter(user => {
      const hasSubmitted = opportunities.some(opp => opp.submittedById === user.id);
      return hasSubmitted || user.id === session?.teamLeadId;
    });
  };

  if (!category) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Manage Category</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Category Details */}
          <TextField
            label="Category Name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <TextField
            label="Description"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            variant="outlined"
          />

          {/* Decider Assignment */}
          <FormControl fullWidth>
            <InputLabel>Assigned Decider</InputLabel>
            <Select
              value={selectedDeciderId}
              onChange={(e) => setSelectedDeciderId(e.target.value)}
              label="Assigned Decider"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {getDeciderCandidates().map(user => (
                <MenuItem key={user.id} value={user.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PersonIcon fontSize="small" />
                    <span>{user.name}</span>
                    {user.id === session?.teamLeadId && (
                      <Chip label="Team Lead" size="small" />
                    )}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* AI Analysis Info */}
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              AI Analysis
            </Typography>
            <Typography variant="body2">
              Confidence: <Chip label={category.aiConfidence} size="small" sx={{ ml: 1 }} />
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {category.aiReasoning}
            </Typography>
          </Alert>

          {/* Opportunities in Category */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Opportunities in this Category ({selectedOpportunityIds.size})
            </Typography>
            <List dense sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {opportunities.map(opp => (
                <ListItem 
                  key={opp.id}
                  secondaryAction={
                    <Checkbox
                      checked={selectedOpportunityIds.has(opp.id)}
                      onChange={() => toggleOpportunity(opp.id)}
                    />
                  }
                >
                  <ListItemText 
                    primary={opp.title}
                    secondary={`${opp.description.substring(0, 80)}...`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Approval Notes */}
          {selectedDeciderId && (
            <TextField
              label="Notes for Decider"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              helperText="Provide context or specific instructions for the assigned decider"
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!editedName.trim() || selectedOpportunityIds.size === 0}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};