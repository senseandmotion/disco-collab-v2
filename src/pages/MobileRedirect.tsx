import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack,
  Paper
} from '@mui/material';
import {
  DesktopMac as DesktopIcon,
  Email as EmailIcon,
  QrCode as QRIcon
} from '@mui/icons-material';

export const MobileRedirect: React.FC = () => {
  const currentUrl = window.location.origin;

  const handleEmailLink = () => {
    const subject = encodeURIComponent('Discovery Collaborative - Desktop Access');
    const body = encodeURIComponent(`Access Discovery Collaborative on your desktop:\n\n${currentUrl}\n\nThis tool is optimized for desktop collaboration and requires a minimum screen width of 1200px for the best experience.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          textAlign: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <DesktopIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
          
          <Typography variant="h4" gutterBottom fontWeight={600} color="primary.main">
            Desktop Required
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            Discovery Collaborative
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            This collaborative tool is designed for desktop use and requires a minimum 
            screen width of 1200px for optimal team collaboration experience.
          </Typography>

          <Stack spacing={3}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<EmailIcon />}
              onClick={handleEmailLink}
              sx={{ py: 1.5 }}
            >
              Email Link to Desktop
            </Button>
            
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <QRIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                QR Code generation would appear here
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {currentUrl}
              </Typography>
            </Box>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            For the best collaborative discovery experience, please access this tool 
            from a desktop or laptop computer.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};