import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';
import { StorageService } from '../../utils/storage';
import type { User, Opportunity, OpportunityCategory } from '../../types';

interface DeciderAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  category?: OpportunityCategory;
  opportunities?: Opportunity[];
  onAssign: (deciderId: string) => void;
}

export const DeciderAssignmentDialog: React.FC<DeciderAssignmentDialogProps> = ({
  open,
  onClose,
  category,
  opportunities,
  onAssign
}) => {
  const { participants, session, opportunities: allOpportunities } = useSession();
  const [selectedDeciderId, setSelectedDeciderId] = useState<string>('');

  // Get opportunities for this category if category is provided
  const categoryOpportunities = category 
    ? allOpportunities.filter(opp => category.opportunityIds.includes(opp.id))
    : opportunities || [];

  // Get suitable decider candidates
  const getDeciderCandidates = (): User[] => {
    return participants.filter(user => {
      // Include team lead and active participants
      const hasSubmitted = allOpportunities.some(opp => opp.submittedById === user.id);
      return hasSubmitted || user.id === session?.teamLeadId;
    });
  };

  const handleAssign = () => {
    if (selectedDeciderId) {
      onAssign(selectedDeciderId);
      onClose();
    }
  };

  const selectedUser = participants.find(p => p.id === selectedDeciderId);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Assign Decider {category ? 'to Category' : ''}
          </Typography>
          <Button onClick={onClose} size="small" color="inherit">
            <CloseIcon />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Context */}
          {category && (
            <Alert severity="info">
              <Typography variant="subtitle2" gutterBottom>
                {category.name}
              </Typography>
              <Typography variant="body2">
                {categoryOpportunities.length} opportunities in this category
              </Typography>
            </Alert>
          )}

          {/* Decider Selection */}
          <FormControl fullWidth>
            <InputLabel>Select Decider</InputLabel>
            <Select
              value={selectedDeciderId}
              onChange={(e) => setSelectedDeciderId(e.target.value)}
              label="Select Decider"
            >
              {getDeciderCandidates().map(user => (
                <MenuItem key={user.id} value={user.id}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                    {user.id === session?.teamLeadId && (
                      <Chip label="Team Lead" size="small" />
                    )}
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Selected User Info */}
          {selectedUser && (
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Decider
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body1">{selectedUser.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Will be responsible for reviewing and approving {category ? 'this category' : 'these opportunities'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Opportunities Preview */}
          {categoryOpportunities.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Opportunities to Review
              </Typography>
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {categoryOpportunities.slice(0, 5).map(opp => (
                  <ListItem key={opp.id}>
                    <ListItemText 
                      primary={opp.title}
                      secondary={`${opp.description.substring(0, 60)}...`}
                    />
                  </ListItem>
                ))}
                {categoryOpportunities.length > 5 && (
                  <ListItem>
                    <ListItemText 
                      secondary={`... and ${categoryOpportunities.length - 5} more opportunities`}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleAssign}
          variant="contained"
          startIcon={<AssignIcon />}
          disabled={!selectedDeciderId}
        >
          Assign Decider
        </Button>
      </DialogActions>
    </Dialog>
  );
};