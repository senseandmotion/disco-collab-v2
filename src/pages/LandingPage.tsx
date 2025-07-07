import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
    <Container maxWidth="md" sx={{ 
      minHeight: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ 
            fontWeight: 900,
            fontSize: { xs: '3rem', md: '4.5rem', lg: '5.5rem' },
            color: '#333',
            mb: 4,
            letterSpacing: '0.02em',
            overflow: 'hidden',
            display: 'inline-block',
            '& .letter': {
              display: 'inline-block',
              animation: 'letterRotateIn 0.75s cubic-bezier(0.19, 1, 0.22, 1) forwards',
              transform: 'translateY(1.1em) translateX(0.55em) rotateZ(180deg)',
            },
            '& .letter:nth-of-type(1)': { animationDelay: '0ms' },
            '& .letter:nth-of-type(2)': { animationDelay: '50ms' },
            '& .letter:nth-of-type(3)': { animationDelay: '100ms' },
            '& .letter:nth-of-type(4)': { animationDelay: '150ms' },
            '& .letter:nth-of-type(5)': { animationDelay: '200ms' },
            '& .letter:nth-of-type(6)': { animationDelay: '250ms' },
            '& .letter:nth-of-type(7)': { animationDelay: '300ms' },
            '& .letter:nth-of-type(8)': { animationDelay: '350ms' },
            '@keyframes letterRotateIn': {
              to: {
                transform: 'translateY(0) translateX(0) rotateZ(0deg)',
              }
            }
          }}
        >
          <span className="letter">D</span>
          <span className="letter">I</span>
          <span className="letter">S</span>
          <span className="letter">C</span>
          <span className="letter">O</span>
          <span className="letter">V</span>
          <span className="letter">E</span>
          <span className="letter">R</span>
        </Typography>
        
        <Box sx={{ 
          animation: 'fadeInUp 1s ease-out 0.8s forwards',
          opacity: 0,
          '@keyframes fadeInUp': {
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            }
          },
          transform: 'translateY(20px)'
        }}>
          <Typography
            variant="h4"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: 300 }}
          >
            AI-Guided Business Problem Discovery
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.primary"
            sx={{ maxWidth: 600, mx: 'auto', mb: 6, fontWeight: 400 }}
          >
            Transform your team's challenges into opportunities. Discover, refine, 
            and prioritize business problems together with intelligent AI guidance.
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/create-session')}
              sx={{ 
                py: 2, 
                px: 4,
                fontSize: '1.1rem',
                minWidth: 200,
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              Create Session
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/join')}
              sx={{ 
                py: 2, 
                px: 4,
                fontSize: '1.1rem',
                minWidth: 200,
                fontWeight: 500,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Join Session
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};