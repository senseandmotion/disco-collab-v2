import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Stack,
  Alert,
  Card,
  CardContent,
  Fab
} from '@mui/material';
import { Add as AddIcon, Psychology as AIIcon } from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';
import { CreateOpportunityDialog } from '../opportunity/CreateOpportunityDialog';
import { OpportunityDetailModal } from '../opportunity/OpportunityDetailModal';
import { ErrorBoundary } from '../common/ErrorBoundary';
import type { Opportunity } from '../../types';

export const DiscoveryPhase: React.FC = () => {
  const { opportunities, isTeamLead } = useSession();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Discovery Phase
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Submit opportunities and collaborate with AI guidance to identify business challenges.
          </Typography>
        </Box>
      </Stack>

      {/* Quick Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">{opportunities.length}</Typography>
            <Typography variant="body2" color="text.secondary">Opportunities</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">
              {opportunities.filter(o => o.status === 'submitted').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Submitted</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">
              {opportunities.filter(o => o.status === 'draft').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Drafts</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Main Content */}
      {opportunities.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<AIIcon />}
            >
              Get AI Guidance
            </Button>
          }
        >
          <Typography variant="body1">
            No opportunities yet. Use the AI Assistant to help identify and articulate business challenges.
          </Typography>
        </Alert>
      ) : (
        <Box>
          {/* Opportunity List will go here */}
          <Typography variant="h6" gutterBottom>
            Recent Opportunities
          </Typography>
          {opportunities.map((opportunity) => (
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
                <Typography variant="h6" gutterBottom>
                  {opportunity.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {opportunity.description.length > 150 
                    ? `${opportunity.description.substring(0, 150)}...`
                    : opportunity.description
                  }
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Status: {opportunity.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    • Created: {new Date(opportunity.createdAt).toLocaleDateString()}
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

      {/* Add Opportunity FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Opportunity Dialog */}
      <ErrorBoundary fallback={<div>Error loading dialog</div>}>
        <CreateOpportunityDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </ErrorBoundary>

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
    </Box>
  );
};