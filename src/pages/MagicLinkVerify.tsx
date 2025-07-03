import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { 
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

export const MagicLinkVerify: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid verification link');
        return;
      }

      try {
        const result = await authService.verifyMagicLink(token);
        
        if (result.success) {
          setStatus('success');
          
          // Refresh the auth context with the new user
          refreshUser();
          
          // Redirect after a short delay
          setTimeout(() => {
            if (result.sessionSlug) {
              navigate(`/session/${result.sessionSlug}`);
            } else {
              navigate('/');
            }
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage('This link has expired or is invalid. Please request a new one.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setErrorMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <Paper elevation={3} sx={{ p: 6, width: '100%', textAlign: 'center', borderRadius: 3 }}>
          {status === 'verifying' && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Verifying your link...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we sign you in.
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
              <Typography variant="h5" gutterBottom color="success.main">
                Success!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You've been successfully signed in. Redirecting you now...
              </Typography>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
              <Typography variant="h5" gutterBottom color="error.main">
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ my: 3 }}>
                {errorMessage}
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
              >
                Back to Home
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};