import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  SmartToy as AIIcon,
  Assignment as AssignIcon,
  CheckCircle as ApproveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';
import { OpportunityDetailModal } from '../opportunity/OpportunityDetailModal';
import type { Opportunity } from '../../types';

export const ReviewPhase: React.FC = () => {
  const { opportunities, isTeamLead, isDecider } = useSession();
  const [contributorDialogOpen, setContributorDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Show dialog for contributors when they first enter review phase
  useEffect(() => {
    if (!isTeamLead && !isDecider) {
      setContributorDialogOpen(true);
    }
  }, [isTeamLead, isDecider]);

  // Contributor view - read-only opportunities
  if (!isTeamLead && !isDecider) {
    const submittedOpportunities = opportunities.filter(opp => opp.status === 'submitted' || opp.status === 'approved');

    return (
      <Box>
        {/* Review Phase Information Dialog */}
        <Dialog 
          open={contributorDialogOpen}
          onClose={() => setContributorDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            Session is now in Review
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              The discovery phase has ended and your team lead is now reviewing all submitted opportunities.
            </Typography>
            <Typography variant="body1" paragraph>
              You can continue to view all submitted opportunities below, but no new opportunities can be added at this time.
            </Typography>
            <Typography variant="body1">
              You'll be notified by email when it's time to prioritize opportunities in the next phase.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContributorDialogOpen(false)} variant="contained">
              Got it
            </Button>
          </DialogActions>
        </Dialog>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Review Phase
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review all submitted opportunities while the team lead organizes them for prioritization.
          </Typography>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6">{submittedOpportunities.length}</Typography>
              <Typography variant="body2" color="text.secondary">Submitted Opportunities</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6">{opportunities.filter(o => o.status === 'approved').length}</Typography>
              <Typography variant="body2" color="text.secondary">Approved</Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Read-only Opportunities */}
        {submittedOpportunities.length === 0 ? (
          <Alert severity="info">
            No opportunities have been submitted yet.
          </Alert>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Submitted Opportunities
            </Typography>
            {submittedOpportunities.map((opportunity) => (
              <Card 
                key={opportunity.id} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
                onClick={() => setSelectedOpportunity(opportunity)}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="h6">
                      {opportunity.title}
                    </Typography>
                    <Chip 
                      label={opportunity.status} 
                      size="small" 
                      color={opportunity.status === 'approved' ? 'success' : 'default'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {opportunity.description.length > 150 
                      ? `${opportunity.description.substring(0, 150)}...`
                      : opportunity.description
                    }
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(opportunity.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Click to view details
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Opportunity Detail Modal */}
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          open={!!selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          readOnly={true}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Review Phase
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review AI categorizations, assign Deciders, and approve opportunity groupings.
          </Typography>
        </Box>
        {isTeamLead && (
          <Button
            variant="outlined"
            startIcon={<AIIcon />}
            onClick={() => {
              // TODO: Trigger AI analysis
              console.log('Generate AI categories');
            }}
          >
            Generate AI Categories
          </Button>
        )}
      </Stack>

      {/* Review Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">{opportunities.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Opportunities</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">0</Typography>
            <Typography variant="body2" color="text.secondary">Categories</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">0</Typography>
            <Typography variant="body2" color="text.secondary">Assigned Deciders</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* AI Categories Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">AI-Generated Categories</Typography>
            <Chip label="Not Generated" color="default" size="small" />
          </Stack>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              AI will analyze all submitted opportunities and suggest logical groupings and potential mergers.
              This helps organize similar ideas and reduce duplication.
            </Typography>
          </Alert>
          
          {/* Placeholder for categories */}
          <Typography variant="body2" color="text.secondary">
            Run AI analysis to generate opportunity categories and merge suggestions.
          </Typography>
        </CardContent>
      </Card>

      {/* Decider Assignment Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Decider Assignments
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Assign team members as Deciders for specific opportunities or categories. 
              Deciders will review and approve AI recommendations.
            </Typography>
          </Alert>
          
          {opportunities.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No opportunities to assign yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {opportunities.slice(0, 3).map((opportunity) => (
                <Card key={opportunity.id} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2">{opportunity.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opportunity.assignedDeciderId ? 'Assigned' : 'Unassigned'}
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        startIcon={<AssignIcon />}
                        variant={opportunity.assignedDeciderId ? "outlined" : "contained"}
                      >
                        {opportunity.assignedDeciderId ? 'Reassign' : 'Assign Decider'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              {opportunities.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  And {opportunities.length - 3} more opportunities...
                </Typography>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Progress Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Review Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track completion of categorization and assignment tasks.
          </Typography>
          {/* Progress indicators will go here */}
        </CardContent>
      </Card>
    </Box>
  );
};