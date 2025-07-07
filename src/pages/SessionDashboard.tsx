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
  Divider,
  Tooltip
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
    updateSession,
    isLoading,
    error 
  } = useSession();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const loadedSessionRef = useRef<string | null>(null);
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [teamLeadViewPhase, setTeamLeadViewPhase] = useState<SessionPhase | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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


  const handlePhaseNavigation = (phase: SessionPhase) => {
    if (!canSeePhase(phase) || !session) return;
    
    if (isTeamLead) {
      // Team Lead can navigate to any accessible phase
      setTeamLeadViewPhase(phase);
    }
    // Non-team leads cannot navigate phases
  };

  // Get the currently displayed phase (team lead view or official phase)
  const getCurrentDisplayPhase = (): SessionPhase => {
    return isTeamLead && teamLeadViewPhase ? teamLeadViewPhase : session?.phase || 'discovery';
  };

  // Reset team lead view when session phase changes or when switching back to official phase
  useEffect(() => {
    if (teamLeadViewPhase === session?.phase) {
      setTeamLeadViewPhase(null);
    }
  }, [session?.phase, teamLeadViewPhase]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      
      // Set minimum width to prevent collapse, but no maximum
      if (newWidth >= 200) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
        <Toolbar sx={{ justifyContent: 'space-between', py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 0 }}>
              {session.name}
            </Typography>
            
            {/* Team Phase Indicator */}
            <Typography variant="caption" sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.7rem'
            }}>
              Team Phase: {session.phase.charAt(0).toUpperCase() + session.phase.slice(1)}
            </Typography>
          </Box>

          {/* Phase Progress Tracker */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            py: 2.5
          }}>
            {phases.map((phase, index) => {
              const currentDisplayPhase = getCurrentDisplayPhase();
              const isCurrentPhase = session.phase === phase.key;
              const isCurrentDisplayPhase = currentDisplayPhase === phase.key;
              const phaseIndex = phases.findIndex(p => p.key === session.phase);
              const displayPhaseIndex = phases.findIndex(p => p.key === currentDisplayPhase);
              const currentIndex = phases.findIndex(p => p.key === phase.key);
              const isPastPhase = currentIndex < phaseIndex;
              const isPastDisplayPhase = currentIndex < displayPhaseIndex;
              const canAccess = canSeePhase(phase.key);
              
              return (
                <React.Fragment key={phase.key}>
                  {/* Phase Circle */}
                  <Tooltip 
                    title={
                      phase.key === 'review' && session.phase === 'review' && !isTeamLead && !isDecider
                        ? "Session is in Review phase. You'll be notified when prioritization begins."
                        : ""
                    }
                    arrow
                    placement="bottom"
                  >
                    <Box
                      onClick={() => handlePhaseNavigation(phase.key)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: isTeamLead ? 'pointer' : 'default',
                        position: 'relative',
                        '&:hover': isTeamLead ? {
                          '& .phase-circle': {
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                          },
                          '& .phase-label': {
                            color: 'rgba(255, 255, 255, 0.9)',
                          }
                        } : {}
                      }}
                    >
                      <Box
                        className="phase-circle"
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: isCurrentDisplayPhase ? 'white' : (isCurrentPhase || isPastPhase ? 'rgba(255, 255, 255, 0.8)' : 'transparent'),
                          border: '2px solid',
                          borderColor: isCurrentDisplayPhase ? 'white' : (isCurrentPhase || isPastPhase ? 'white' : 'rgba(255, 255, 255, 0.3)'),
                          boxShadow: isCurrentDisplayPhase && teamLeadViewPhase ? '0 0 0 2px rgba(255, 255, 255, 0.5)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          mb: 0.5
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: isCurrentDisplayPhase ? 'primary.main' : (isCurrentPhase || isPastPhase ? 'primary.main' : 'white'),
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Typography>
                      </Box>
                      <Typography
                        className="phase-label"
                        variant="caption"
                        sx={{
                          color: isCurrentDisplayPhase ? 'white' : (isCurrentPhase || isPastPhase ? 'white' : 'rgba(255, 255, 255, 0.5)'),
                          fontWeight: isCurrentDisplayPhase ? 600 : (isCurrentPhase ? 600 : 400),
                          whiteSpace: 'nowrap',
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {phase.label}
                      </Typography>
                    </Box>
                  </Tooltip>
                  
                  {/* Connecting Line */}
                  {index < phases.length - 1 && (
                    <Box
                      sx={{
                        width: 80,
                        height: 2,
                        backgroundColor: currentIndex < phaseIndex ? 'white' : 'rgba(255, 255, 255, 0.3)',
                        mx: 2,
                        mb: 3.5
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Stack alignItems="flex-start" sx={{ mr: 1 }}>
              <Typography variant="body2">{user.name}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'capitalize' }}>
                {currentUserRole.replace('-', ' ')}
              </Typography>
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
      <Box ref={containerRef} sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Panel - AI Chat (Hidden during Prioritization) */}
        {getCurrentDisplayPhase() !== 'prioritization' && getCurrentDisplayPhase() !== 'completed' && (
          <>
            <Paper
              elevation={0}
              sx={{
                width: `${chatWidth}px`,
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'grey.50',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">AI Assistant</Typography>
                <Typography variant="body2" color="text.secondary">
                  Get guidance and suggestions
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <ChatInterface 
                  onOpportunityExtracted={(data) => {
                    // TODO: Handle opportunity extraction
                    console.log('Opportunity data extracted:', data);
                  }}
                />
              </Box>
            </Paper>
            
            {/* Resize Handle */}
            <Box
              onMouseDown={handleMouseDown}
              sx={{
                width: '4px',
                cursor: 'col-resize',
                backgroundColor: isResizing ? 'primary.main' : 'transparent',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '-2px',
                  right: '-2px',
                  cursor: 'col-resize'
                }
              }}
            />
          </>
        )}

        {/* Right Panel - Context-Dependent Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
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
            {getCurrentDisplayPhase() === 'discovery' && <DiscoveryPhase />}
            {getCurrentDisplayPhase() === 'review' && <ReviewPhase />}
            {getCurrentDisplayPhase() === 'prioritization' && <PrioritizationPhase />}
            {getCurrentDisplayPhase() === 'completed' && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h4" gutterBottom>Session Complete</Typography>
                <Typography variant="body1" color="text.secondary">
                  This session has been marked as completed.
                </Typography>
              </Box>
            )}
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