import React from 'react';
import { 
  Box, 
  Typography, 
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
  Button
} from '@mui/material';
import { 
  SmartToy as AIIcon,
  Assignment as AssignIcon,
  CheckCircle as ApproveIcon 
} from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';

export const ReviewPhase: React.FC = () => {
  const { opportunities, isTeamLead, isDecider } = useSession();

  if (!isTeamLead && !isDecider) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Review Phase
        </Typography>
        <Alert severity="info">
          The Team Lead is reviewing AI categorizations and assigning Deciders. 
          You'll be notified when there are items for you to review.
        </Alert>
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