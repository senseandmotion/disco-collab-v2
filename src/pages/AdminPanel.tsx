import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  TrendingUp as AdvanceIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  HelpOutline as HelpIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import type { SessionPhase } from '../types';

export const AdminPanel: React.FC = () => {
  const { sessionSlug } = useParams<{ sessionSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { session, updateSession, opportunities, participants, isTeamLead, loadSession, isLoading, error } = useSession();
  
  // State management
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [lastPhaseChange, setLastPhaseChange] = useState<{ from: SessionPhase; to: SessionPhase } | null>(null);
  const [undoTimeLeft, setUndoTimeLeft] = useState(0);
  
  // Settings state
  const [minOpportunities, setMinOpportunities] = useState(5);
  const [minUsers, setMinUsers] = useState(3);
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // Load session effect
  useEffect(() => {
    if (sessionSlug && user) {
      loadSession(sessionSlug);
    }
  }, [sessionSlug, user, loadSession]);
  
  useEffect(() => {
    // Redirect non-team leads
    if (session && !isTeamLead) {
      navigate(`/session/${sessionSlug}`);
    }
  }, [session, isTeamLead, navigate, sessionSlug]);

  // Undo timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showUndoNotification && undoTimeLeft > 0) {
      timer = setTimeout(() => {
        setUndoTimeLeft(undoTimeLeft - 1);
      }, 1000);
    } else if (undoTimeLeft === 0 && showUndoNotification) {
      setShowUndoNotification(false);
      setLastPhaseChange(null);
    }
    return () => clearTimeout(timer);
  }, [showUndoNotification, undoTimeLeft]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!session || !isTeamLead) {
    return null;
  }

  const getPhaseOrder = (): SessionPhase[] => ['discovery', 'review', 'prioritization', 'completed'];
  
  const getCurrentPhaseIndex = () => getPhaseOrder().indexOf(session.phase);
  
  const getNextPhase = (): SessionPhase | null => {
    const phases = getPhaseOrder();
    const currentIndex = getCurrentPhaseIndex();
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  };

  const getThresholdStatus = () => {
    const submittedOpportunities = opportunities.filter(opp => opp.status === 'submitted' || opp.status === 'approved');
    const uniqueSubmitters = new Set(submittedOpportunities.map(opp => opp.submittedById)).size;
    const reviewedOpportunities = opportunities.filter(opp => opp.status === 'approved');
    
    return {
      opportunityCount: submittedOpportunities.length,
      userCount: uniqueSubmitters,
      reviewedCount: reviewedOpportunities.length,
      totalOpportunities: opportunities.length,
      meetsThreshold: submittedOpportunities.length >= minOpportunities && uniqueSubmitters >= minUsers
    };
  };

  const getPhaseAdviceMessage = () => {
    const nextPhase = getNextPhase();
    if (!nextPhase) return null;

    const status = getThresholdStatus();
    
    switch (session.phase) {
      case 'discovery':
        if (status.meetsThreshold) {
          return {
            type: 'success' as const,
            title: 'Ready to advance to Review phase',
            message: `${status.opportunityCount} opportunities submitted by ${status.userCount} participants. Ready to start reviewing!`,
            action: 'Move to Review'
          };
        } else {
          const moreOpps = Math.max(0, minOpportunities - status.opportunityCount);
          const moreUsers = Math.max(0, minUsers - status.userCount);
          return {
            type: 'info' as const,
            title: 'Discovery in progress',
            message: `Need ${moreOpps} more opportunities from ${moreUsers} more participants to move to the Review phase.`,
            action: null
          };
        }
      
      case 'review':
        const unreviewed = status.totalOpportunities - status.reviewedCount;
        if (unreviewed === 0) {
          return {
            type: 'success' as const,
            title: 'Ready to advance to Prioritization',
            message: 'All opportunities have been reviewed and approved. Ready to start prioritization!',
            action: 'Move to Prioritization'
          };
        } else {
          return {
            type: 'warning' as const,
            title: 'Review incomplete',
            message: `${unreviewed} opportunities still need review before advancing to prioritization.`,
            action: 'Force Advance',
            showUnreviewed: true
          };
        }
      
      case 'prioritization':
        return {
          type: 'info' as const,
          title: 'Prioritization in progress',
          message: 'Participants are scoring opportunities. You can complete the session when ready.',
          action: 'Mark Complete'
        };
      
      default:
        return null;
    }
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join?session=${session.slug}&invite=${session.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  const handlePhaseAdvance = (targetPhase: SessionPhase) => {
    const currentPhase = session.phase;
    setLastPhaseChange({ from: currentPhase, to: targetPhase });
    updateSession({ phase: targetPhase });
    setShowUndoNotification(true);
    setUndoTimeLeft(10); // 10 second undo window
  };

  const handleUndoPhaseChange = () => {
    if (lastPhaseChange) {
      updateSession({ phase: lastPhaseChange.from });
      setShowUndoNotification(false);
      setLastPhaseChange(null);
    }
  };

  const advice = getPhaseAdviceMessage();
  const status = getThresholdStatus();
  const unreviewedOpportunities = opportunities.filter(opp => opp.status !== 'approved');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <IconButton onClick={() => navigate(`/session/${sessionSlug}`)}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Admin Panel
        </Typography>
      </Stack>

      <Stack spacing={4}>
        {/* Session Info */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" gutterBottom>
                Session: {session.name}
              </Typography>
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Phase
                  </Typography>
                  <Typography variant="body1">
                    {session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Participants
                  </Typography>
                  <Typography variant="body1">
                    {participants.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Opportunities
                  </Typography>
                  <Typography variant="body1">
                    {status.opportunityCount} submitted
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            {/* Manual Phase Advancement */}
            <Box>
              {session.phase === 'discovery' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handlePhaseAdvance('review')}
                  startIcon={<AdvanceIcon />}
                >
                  Move to Review Phase
                </Button>
              )}
              {session.phase === 'review' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handlePhaseAdvance('prioritization')}
                  startIcon={<AdvanceIcon />}
                >
                  Move to Prioritization Phase
                </Button>
              )}
              {session.phase === 'prioritization' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handlePhaseAdvance('completed')}
                  startIcon={<CheckIcon />}
                >
                  Mark Session Complete
                </Button>
              )}
            </Box>
          </Stack>
        </Paper>

        {/* Phase Management */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Phase Management
          </Typography>
          
          {advice && (
            <Alert 
              severity={advice.type} 
              sx={{ mb: 3 }}
              action={
                advice.action && (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => {
                      const nextPhase = getNextPhase();
                      if (nextPhase) handlePhaseAdvance(nextPhase);
                    }}
                    startIcon={advice.type === 'warning' ? <WarningIcon /> : <AdvanceIcon />}
                  >
                    {advice.action}
                  </Button>
                )
              }
            >
              <Typography variant="subtitle2">{advice.title}</Typography>
              <Typography variant="body2">{advice.message}</Typography>
            </Alert>
          )}

          {/* Show unreviewed opportunities if relevant */}
          {advice?.showUnreviewed && unreviewedOpportunities.length > 0 && (
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Opportunities needing review:
                </Typography>
                <List dense>
                  {unreviewedOpportunities.slice(0, 5).map(opp => (
                    <ListItem key={opp.id} disablePadding>
                      <ListItemButton onClick={() => {/* TODO: Open opportunity review */}}>
                        <ListItemText 
                          primary={opp.title}
                          secondary={`Status: ${opp.status}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {unreviewedOpportunities.length > 5 && (
                    <ListItem>
                      <ListItemText secondary={`... and ${unreviewedOpportunities.length - 5} more`} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => {
                  unreviewedOpportunities.forEach(opp => {
                    // TODO: Auto-approve all opportunities
                    console.log('Auto-approving opportunity:', opp.id);
                  });
                }}>
                  Approve All
                </Button>
              </CardActions>
            </Card>
          )}

          {/* Phase Advancement Settings */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Set your goals for the number of opportunities and contributors needed before moving 
              to the next phase. When these goals are met, you'll get a suggestion to advance the 
              team to start reviewing and refining the submitted opportunities.
            </Typography>
            
            <Stack spacing={2} direction="row" alignItems="flex-start">
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Typography variant="body2" component="label">
                    Min Opportunities
                  </Typography>
                  <Tooltip title="Required opportunities to suggest Review phase">
                    <HelpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <TextField
                  type="number"
                  value={minOpportunities}
                  onChange={(e) => setMinOpportunities(Number(e.target.value))}
                  size="small"
                  sx={{ width: 150 }}
                  inputProps={{ min: 1 }}
                />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Typography variant="body2" component="label">
                    Min Contributors
                  </Typography>
                  <Tooltip title="Number of different people who need to submit opportunities. Can't be more than the number of opportunities needed.">
                    <HelpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                <TextField
                  type="number"
                  value={minUsers}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    // Validate that contributors doesn't exceed opportunities
                    if (newValue <= minOpportunities) {
                      setMinUsers(newValue);
                    }
                  }}
                  size="small"
                  sx={{ width: 150 }}
                  inputProps={{ min: 1, max: minOpportunities }}
                  error={minUsers > minOpportunities}
                  helperText={minUsers > minOpportunities ? 'Cannot exceed min opportunities' : ''}
                />
              </Box>
            </Stack>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={settingsSaved ? <CheckIcon /> : <SaveIcon />}
                onClick={() => {
                  // TODO: Save settings to storage/backend
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 2000);
                }}
              >
                {settingsSaved ? 'Saved' : 'Save'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Invite Your Team */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Invite Your Team
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={inviteLinkCopied ? <CheckIcon /> : <CopyIcon />}
              onClick={handleCopyInviteLink}
            >
              {inviteLinkCopied ? 'Copied!' : 'Copy Invite Link'}
            </Button>
            <Typography variant="body2" color="text.secondary">
              Share this link with participants to join the session
            </Typography>
          </Stack>
        </Paper>

      </Stack>

      {/* Undo Notification */}
      <Snackbar
        open={showUndoNotification}
        onClose={() => setShowUndoNotification(false)}
        message={`Phase changed to ${lastPhaseChange?.to}. Undoing in ${undoTimeLeft}s`}
        action={
          <Stack direction="row" spacing={1}>
            <Button color="inherit" size="small" onClick={handleUndoPhaseChange}>
              UNDO
            </Button>
            <IconButton color="inherit" size="small" onClick={() => setShowUndoNotification(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        }
      />
    </Container>
  );
};