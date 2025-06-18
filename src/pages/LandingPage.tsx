import React from 'react';
import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import LoginIcon from '@mui/icons-material/Login';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            maxWidth: 600,
            width: '100%',
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            Discovery
          </Typography>
          
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ mb: 4 }}
          >
            Collaborative Business Problem Discovery Tool
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 5 }}>
            Transform your team's challenges into opportunities. Discover, refine, 
            and prioritize business problems together in real-time.
          </Typography>

          <Stack direction="column" spacing={2} sx={{ maxWidth: 300, mx: 'auto' }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<GroupAddIcon />}
              onClick={() => navigate('/create-session')}
              sx={{ py: 1.5 }}
            >
              Create New Session
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<LoginIcon />}
              onClick={() => navigate('/join-session')}
              sx={{ py: 1.5 }}
            >
              Join Existing Session
            </Button>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4 }}
          >
            Ready to transform how your team discovers and solves problems
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};