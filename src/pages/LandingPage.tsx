import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  GroupAdd as GroupAddIcon,
  Login as LoginIcon,
  Psychology as AIIcon,
  Groups as TeamIcon,
  Analytics as PriorityIcon,
  SmartToy as SmartIcon
} from '@mui/icons-material';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Check if this is a mobile device and redirect to mobile splash
    if (isMobile && window.innerWidth < 1200) {
      navigate('/mobile-redirect');
      return;
    }
  }, [isMobile, navigate]);

  return (
    <Container maxWidth="xl" sx={{ minHeight: '100vh', py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ 
            fontWeight: 800,
            fontSize: { xs: '3rem', md: '4rem' },
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Discovery Collaborative
        </Typography>
        
        <Typography
          variant="h4"
          color="text.secondary"
          sx={{ mb: 3, fontWeight: 300 }}
        >
          AI-Guided Business Problem Discovery
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.primary"
          sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}
        >
          Transform your team's challenges into opportunities. Discover, refine, 
          and prioritize business problems together with intelligent AI guidance.
        </Typography>

        {/* Equal-weight CTAs */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={3} 
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 8 }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<GroupAddIcon />}
            onClick={() => navigate('/create-session')}
            sx={{ 
              py: 2, 
              px: 4,
              fontSize: '1.1rem',
              minWidth: 250,
              height: 56
            }}
          >
            Create New Session
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<LoginIcon />}
            onClick={() => navigate('/join')}
            sx={{ 
              py: 2, 
              px: 4,
              fontSize: '1.1rem',
              minWidth: 250,
              height: 56,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              }
            }}
          >
            Join Session
          </Button>
        </Stack>
      </Box>

      {/* Feature Highlights */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                AI Guidance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intelligent prompts and suggestions help teams articulate problems clearly 
                and discover hidden opportunities through structured questioning.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <TeamIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Team Collaboration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time collaboration with role-based workflows. Team Leads manage phases, 
                Deciders approve recommendations, Contributors submit opportunities.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%', textAlign: 'center', p: 2 }}>
            <CardContent>
              <PriorityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Priority Matrix
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Impact/Effort scoring with visual priority matrix helps teams focus 
                on high-impact, low-effort opportunities for maximum ROI.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works */}
      <Paper elevation={1} sx={{ p: 6, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <SmartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Intelligent Discovery Process
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Our AI Assistant guides teams through a proven three-phase workflow: 
          Discovery, Review, and Prioritization. Each phase builds on the previous, 
          ensuring comprehensive problem identification and strategic prioritization.
        </Typography>
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center">
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              Phase 1: Discovery
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-guided opportunity submission with structured questioning
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              Phase 2: Review
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI categorization and merge suggestions with team refinement
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              Phase 3: Prioritization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Impact/effort scoring with visual priority matrix and export
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 8, py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Built for desktop collaboration • Optimized for teams of 3-10 participants
        </Typography>
      </Box>
    </Container>
  );
};