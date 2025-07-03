import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import {
  AccountCircle as UserIcon,
  ExitToApp as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SessionProvider, useSession } from '../context/SessionContext';
import { StorageService } from '../utils/storage';
import { DiscoveryPhase } from '../components/session/DiscoveryPhase';
import { ReviewPhase } from '../components/session/ReviewPhase';
import { PrioritizationPhase } from '../components/session/PrioritizationPhase';
import { ChatInterface } from '../components/ai/ChatInterface';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import type { SessionPhase } from '../types';

interface SessionDashboardProps {
  children?: React.ReactNode;
}

const SessionDashboardContent: React.FC = () => {
  const { sessionSlug } = useParams<{ sessionSlug: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    session, 
    participants, 
    currentUserRole, 
    isTeamLead, 
    isDecider,
    loadSession,
    isLoading,
    error 
  } = useSession();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const loadedSessionRef = useRef<string | null>(null);
  
  // Phase configuration
  const phases: { key: SessionPhase; label: string }[] = [
    { key: 'discovery', label: 'Discovery' },
    { key: 'review', label: 'Review' },
    { key: 'prioritization', label: 'Prioritization' }
  ];

  // Simplified session loading - wait for user to load first
  useEffect(() => {
    if (!sessionSlug) return;
    
    // Wait for AuthContext to load user first
    if (!user) return;
    
    // Load session data directly
    const sessionData = StorageService.getSession(sessionSlug);
    if (sessionData) {
      // Use the existing loadSession but only once
      loadSession(sessionSlug).catch(() => {
        console.log('Session loading had issues, but continuing anyway');
      });
    }
  }, [sessionSlug, user]); // Depend on both sessionSlug and user

  const canSeePhase = (phase: SessionPhase): boolean => {
    if (isTeamLead || isDecider) return true;
    return session?.phase === phase;
  };

  const handlePhaseClick = (phase: SessionPhase) => {
    if (!canSeePhase(phase)) return;
    // TODO: Handle phase navigation
  };

  const handleCopyInviteLink = () => {
    if (!session) return;
    
    const inviteUrl = `${window.location.origin}/join?session=${session.slug}&invite=${session.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!session || !user) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 4 }}>
            {session.name}
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'grey.300', mr: 4 }}>
            {session.slug}
          </Typography>

          {/* Phase Navigation */}
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1 }}>
            {phases.map((phase) => {
              const isCurrentPhase = session.phase === phase.key;
              const canAccess = canSeePhase(phase.key);
              
              return (
                <Button
                  key={phase.key}
                  onClick={() => handlePhaseClick(phase.key)}
                  disabled={!canAccess}
                  sx={{
                    color: isCurrentPhase ? 'white' : 'grey.300',
                    fontWeight: isCurrentPhase ? 600 : 400,
                    borderBottom: isCurrentPhase ? '2px solid white' : 'none',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    '&:disabled': {
                      color: 'grey.500'
                    }
                  }}
                >
                  {phase.label}
                </Button>
              );
            })}
          </Stack>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isTeamLead && (
              <Button
                size="small"
                variant="outlined"
                startIcon={inviteLinkCopied ? <CheckIcon /> : <CopyIcon />}
                onClick={handleCopyInviteLink}
                sx={{ 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {inviteLinkCopied ? 'Copied!' : 'Copy Invite Link'}
              </Button>
            )}
            
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={currentUserRole.replace('-', ' ')}
                size="small"
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
              />
              <Typography variant="body2">{user.name}</Typography>
            </Stack>
            
            <IconButton
              size="large"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              color="inherit"
            >
              <UserIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Stack>
                  <Typography variant="body2">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Stack>
              </MenuItem>
              <Divider />
              {isTeamLead && (
                <MenuItem onClick={() => navigate(`/session/${sessionSlug}/admin`)}>
                  <AdminIcon sx={{ mr: 1 }} />
                  Admin Panel
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area - Split Panel */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - AI Chat (Hidden during Prioritization) */}
        {session.phase !== 'prioritization' && (
          <Paper
            elevation={0}
            sx={{
              width: '400px',
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'grey.50'
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">AI Assistant</Typography>
              <Typography variant="body2" color="text.secondary">
                Get guidance and suggestions
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <ChatInterface 
                onOpportunityExtracted={(data) => {
                  // TODO: Handle opportunity extraction
                  console.log('Opportunity data extracted:', data);
                }}
              />
            </Box>
          </Paper>
        )}

        {/* Right Panel - Context-Dependent Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sub-header with session info */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle1">
                  Phase: <strong>{session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}</strong>
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2" color="text.secondary">
                  {participants.length} participants
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Main content area */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
            {session.phase === 'discovery' && <DiscoveryPhase />}
            {session.phase === 'review' && <ReviewPhase />}
            {session.phase === 'prioritization' && <PrioritizationPhase />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const SessionDashboard: React.FC<SessionDashboardProps> = () => {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <SessionDashboardContent />
      </SessionProvider>
    </ErrorBoundary>
  );
};