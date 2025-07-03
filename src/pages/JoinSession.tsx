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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Email as EmailIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StorageService } from '../utils/storage';
import type { Session, User } from '../types';

export const JoinSession: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSessionCodeInput, setShowSessionCodeInput] = useState(false);
  const [emailValidated, setEmailValidated] = useState(false);
  
  const sessionSlug = searchParams.get('session');
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    // If we have session and invite parameters, validate them
    if (sessionSlug && inviteToken) {
      // Load session data
      const sessionData = StorageService.getSession(sessionSlug);
      if (!sessionData) {
        setErrors({ general: 'Session not found. Please check your invite link.' });
        return;
      }

      // Validate invite token
      if (sessionData.inviteToken !== inviteToken) {
        setErrors({ general: 'Invalid invite token. Please use the link provided by your Team Lead.' });
        return;
      }

      setSession(sessionData);
      setShowSessionCodeInput(false);
    } else {
      // If no parameters, show the session code input interface
      setShowSessionCodeInput(true);
    }
  }, [sessionSlug, inviteToken]);

  const handleSessionCodeLookup = () => {
    if (!sessionCode.trim()) {
      setErrors({ sessionCode: 'Please enter a session code' });
      return;
    }

    // Look for sessions by slug (treating session code as slug for now)
    const sessionData = StorageService.getSession(sessionCode.toLowerCase());
    if (!sessionData) {
      setErrors({ sessionCode: 'Session not found. Please check your session code.' });
      return;
    }

    setSession(sessionData);
    setShowSessionCodeInput(false);
    setErrors({});
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Reset validation state when email changes
    if (emailValidated) {
      setEmailValidated(false);
      setIsReturningUser(false);
    }
  };

  const validateEmail = (email: string, trigger: 'blur' | 'enter') => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const existingUser = StorageService.getUserByEmail(email);
      const isExistingUser = !!existingUser;
      setIsReturningUser(isExistingUser);
      setEmailValidated(true);
      
      // Auto-submit for returning users only when triggered by Enter (showing intent to proceed)
      if (isExistingUser && trigger === 'enter') {
        handleSubmit();
      }
    } else {
      setIsReturningUser(false);
      setEmailValidated(false);
    }
  };

  const handleEmailBlur = () => {
    validateEmail(email, 'blur');
  };

  const handleEmailKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      validateEmail(email, 'enter');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isReturningUser) {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!companyRole.trim()) {
        newErrors.companyRole = 'Company role is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !session) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isReturningUser) {
        // For returning user, update their session list and log them in
        const existingUser = StorageService.getUserByEmail(email);
        if (existingUser) {
          // Add session to user's sessions if not already there
          if (!existingUser.sessions.includes(session.id)) {
            existingUser.sessions.push(session.id);
          }
          existingUser.lastLoginAt = new Date().toISOString();
          
          // Add user to session participants if not already there
          if (!session.participants.includes(existingUser.id)) {
            session.participants.push(existingUser.id);
            session.updatedAt = new Date().toISOString();
            StorageService.saveSession(session);
          }
          
          // Save updated user and set as current
          StorageService.saveUser(existingUser);
          StorageService.setCurrentUser(existingUser);
          
          // Trigger user update event for AuthContext
          window.dispatchEvent(new Event('userUpdated'));
          
          // Redirect directly to session
          navigate(`/session/${session.slug}`);
          return;
        }
      }
      
      // Create new user
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const user: User = {
        id: userId,
        email,
        name,
        companyRole,
        sessions: [session.id],
        digestSettings: {
          enabled: true,
          time: import.meta.env.VITE_DIGEST_DEFAULT_TIME || '16:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      // Save user
      StorageService.saveUser(user);

      // Add user to session participants
      if (!session.participants.includes(user.id)) {
        session.participants.push(user.id);
        session.updatedAt = new Date().toISOString();
        StorageService.saveSession(session);
      }

      // Set as current user
      StorageService.setCurrentUser(user);
      
      // Trigger user update event for AuthContext
      window.dispatchEvent(new Event('userUpdated'));
      
      // Redirect directly to session
      navigate(`/session/${session.slug}`);
    } catch (error) {
      console.error('Join session error:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session && !errors.general && !showSessionCodeInput) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading session...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (errors.general && !session) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            startIcon={<BackIcon />}
          >
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 6, borderRadius: 3 }}>
        {/* Session Code Input Interface */}
        {showSessionCodeInput ? (
          <>
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/')}
                sx={{ mb: 3 }}
              >
                Back to Home
              </Button>
              
              <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
                Join Session
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Enter the session code provided by your Team Lead to join.
              </Typography>
            </Box>

            <Stack spacing={3}>
              <TextField
                label="Session Code"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Enter session code"
                error={!!errors.sessionCode}
                helperText={errors.sessionCode || 'Ask your Team Lead for the session code'}
                fullWidth
                required
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    textTransform: 'lowercase'
                  }
                }}
              />

              {errors.general && (
                <Alert severity="error">{errors.general}</Alert>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleSessionCodeLookup}
                disabled={!sessionCode.trim()}
                fullWidth
                sx={{ py: 2 }}
              >
                Find Session
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/')}
                sx={{ mb: 3 }}
              >
                Back to Home
              </Button>
              
              <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
                Join Session
              </Typography>
              
              {session && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  You're joining: <strong>{session.name}</strong>
                </Alert>
              )}
            </Box>

            <Stack spacing={3}>
              <TextField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyPress={handleEmailKeyPress}
                placeholder="your.email@company.com"
                error={!!errors.email}
                helperText={errors.email || (emailValidated && isReturningUser ? 'Welcome back! Press Enter to log in automatically or click Continue.' : emailValidated && !isReturningUser ? 'New user - please fill in your details below.' : 'Enter your work email address and press Enter or click away to continue')}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  )
                }}
              />

              {emailValidated && !isReturningUser && (
                <>
                  <TextField
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                    required
                  />
                  
                  <TextField
                    label="Company Role"
                    value={companyRole}
                    onChange={(e) => setCompanyRole(e.target.value)}
                    placeholder="Senior Accountant, VP Finance, etc."
                    error={!!errors.companyRole}
                    helperText={errors.companyRole || 'Your role helps team members understand your perspective'}
                    fullWidth
                    required
                  />
                </>
              )}

              {errors.general && (
                <Alert severity="error">{errors.general}</Alert>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isSubmitting || !email}
                fullWidth
                sx={{ py: 2 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
};