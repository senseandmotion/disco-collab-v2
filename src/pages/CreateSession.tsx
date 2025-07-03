import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Stack,
  Alert,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as BackIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import SlugService from '../services/slugService';
import { StorageService } from '../utils/storage';
import type { Session, User } from '../types';

export const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'unavailable' | 'invalid' | null>(null);
  const [teamLeadName, setTeamLeadName] = useState('');
  const [teamLeadEmail, setTeamLeadEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate slug when session name changes
  useEffect(() => {
    if (sessionName.length >= 3) {
      const generatedSlug = SlugService.generateSlug(sessionName);
      setSlug(generatedSlug);
    } else {
      setSlug('');
      setSlugStatus(null);
    }
  }, [sessionName]);

  // Validate slug when it changes
  useEffect(() => {
    if (slug.length >= 3) {
      validateSlug(slug);
    } else {
      setSlugStatus(null);
    }
  }, [slug]);

  const validateSlug = async (slugToValidate: string) => {
    setSlugStatus('checking');
    
    if (!SlugService.validateSlug(slugToValidate)) {
      setSlugStatus('invalid');
      return;
    }

    const isAvailable = await SlugService.checkSlugAvailability(slugToValidate);
    setSlugStatus(isAvailable ? 'available' : 'unavailable');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!sessionName.trim() || sessionName.length < 3) {
      newErrors.sessionName = 'Session name must be at least 3 characters';
    }

    if (!slug || slugStatus !== 'available') {
      newErrors.slug = 'Please ensure the URL slug is valid and available';
    }

    if (!teamLeadName.trim()) {
      newErrors.teamLeadName = 'Team lead name is required';
    }

    if (!teamLeadEmail.trim()) {
      newErrors.teamLeadEmail = 'Team lead email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teamLeadEmail)) {
      newErrors.teamLeadEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSession = async () => {
    if (!validateForm()) return;

    setIsCreating(true);

    try {
      // Check if user already exists
      let user = StorageService.getUserByEmail(teamLeadEmail);
      const sessionId = uuidv4();
      
      if (user) {
        // Update existing user
        console.log('Found existing user:', JSON.stringify(user, null, 2));
        user.name = teamLeadName; // Update name in case it changed
        if (!user.sessions.includes(sessionId)) {
          user.sessions.push(sessionId);
        }
        user.lastLoginAt = new Date().toISOString();
      } else {
        // Create new user
        const userId = uuidv4();
        user = {
          id: userId,
          email: teamLeadEmail,
          name: teamLeadName,
          sessions: [sessionId],
          digestSettings: {
            enabled: true,
            time: import.meta.env.VITE_DIGEST_DEFAULT_TIME || '16:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
      }

      // Create session
      const session: Session = {
        id: sessionId,
        slug,
        name: sessionName,
        teamLeadId: user.id,
        phase: 'discovery',
        participants: [user.id],
        inviteToken: SlugService.generateInviteToken(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        isArchived: false
      };

      // Save to storage
      StorageService.saveUser(user);
      StorageService.saveSession(session);
      StorageService.setCurrentUser(user);

      // Initialize empty opportunities array
      StorageService.saveOpportunities(session.id, []);

      // Trigger user update event for AuthContext
      window.dispatchEvent(new Event('userUpdated'));

      console.log('Created session:', JSON.stringify(session, null, 2));
      console.log('User after creation:', JSON.stringify(user, null, 2));

      // Navigate to session dashboard
      navigate(`/session/${slug}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      setErrors({ submit: 'Failed to create session. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const getSlugIcon = () => {
    switch (slugStatus) {
      case 'checking':
        return <CircularProgress size={20} />;
      case 'available':
        return <CheckIcon color="success" />;
      case 'unavailable':
      case 'invalid':
        return <CloseIcon color="error" />;
      default:
        return null;
    }
  };

  const getSlugHelperText = () => {
    switch (slugStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'URL is available';
      case 'unavailable':
        return 'This URL is already taken';
      case 'invalid':
        return 'URL must be 3-50 characters, letters, numbers, and hyphens only';
      default:
        return 'Your session URL will be generated automatically';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 6, borderRadius: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/')}
            sx={{ mb: 3 }}
          >
            Back to Home
          </Button>
          
          <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
            Create New Session
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Set up a collaborative discovery session for your team. You'll be the Team Lead 
            and can invite participants using the generated link.
          </Typography>
        </Box>

        <Stack spacing={4}>
          {/* Session Name */}
          <TextField
            label="Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="AI Opportunities for Accounting Team"
            error={!!errors.sessionName}
            helperText={errors.sessionName || 'Choose a descriptive name for your discovery session'}
            fullWidth
            required
          />

          {/* URL Slug Preview */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Session URL Preview
            </Typography>
            <TextField
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ai-opportunities-for-accounting-team"
              error={!!errors.slug}
              helperText={getSlugHelperText()}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/session/
                  </InputAdornment>
                ),
                endAdornment: slug && (
                  <InputAdornment position="end">
                    {getSlugIcon()}
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace'
                }
              }}
            />
          </Box>

          {/* Team Lead Information */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Team Lead Information
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Your Name"
                value={teamLeadName}
                onChange={(e) => setTeamLeadName(e.target.value)}
                placeholder="John Smith"
                error={!!errors.teamLeadName}
                helperText={errors.teamLeadName}
                fullWidth
                required
              />
              
              <TextField
                label="Your Email"
                type="email"
                value={teamLeadEmail}
                onChange={(e) => setTeamLeadEmail(e.target.value)}
                placeholder="john.smith@company.com"
                error={!!errors.teamLeadEmail}
                helperText={errors.teamLeadEmail || 'Used for session management and notifications'}
                fullWidth
                required
              />
            </Stack>
          </Box>

          {/* Error Display */}
          {errors.submit && (
            <Alert severity="error">{errors.submit}</Alert>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={isCreating}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              onClick={handleCreateSession}
              disabled={isCreating || slugStatus !== 'available' || !sessionName || !teamLeadName || !teamLeadEmail}
              sx={{ minWidth: 160 }}
            >
              {isCreating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};