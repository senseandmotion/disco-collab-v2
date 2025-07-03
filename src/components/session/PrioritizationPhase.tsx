import React from 'react';
import { 
  Box, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Stack,
  Slider,
  Paper,
  Alert
} from '@mui/material';
import { useSession } from '../../context/SessionContext';

export const PrioritizationPhase: React.FC = () => {
  const { opportunities, session } = useSession();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Prioritization Phase
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Score each opportunity on Impact (potential value) and Effort (implementation difficulty) using a 0-10 scale.
        </Typography>
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Impact:</strong> How significant would the positive outcome be? (0 = minimal impact, 10 = transformational)
          <br />
          <strong>Effort:</strong> How difficult would this be to implement? (0 = very easy, 10 = extremely difficult)
        </Typography>
      </Alert>

      {/* Priority Matrix Visualization */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Impact vs Effort Matrix
        </Typography>
        <Box 
          sx={{ 
            width: '100%', 
            height: 300, 
            backgroundColor: 'white',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            position: 'relative'
          }}
        >
          {/* Grid lines and labels */}
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: 0, 
            right: 0, 
            height: 1, 
            backgroundColor: 'divider' 
          }} />
          <Box sx={{ 
            position: 'absolute', 
            left: '50%', 
            top: 0, 
            bottom: 0, 
            width: 1, 
            backgroundColor: 'divider' 
          }} />
          
          {/* Quadrant Labels */}
          <Typography 
            variant="caption" 
            sx={{ position: 'absolute', top: 8, left: 8, color: 'text.secondary' }}
          >
            Low Impact, Low Effort
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
          >
            High Impact, Low Effort
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ position: 'absolute', bottom: 8, left: 8, color: 'text.secondary' }}
          >
            Low Impact, High Effort
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ position: 'absolute', bottom: 8, right: 8, color: 'text.secondary' }}
          >
            High Impact, High Effort
          </Typography>
          
          {/* Center message */}
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="text.secondary">
              Opportunities will appear here as you score them
            </Typography>
          </Box>
        </Box>
        
        {/* Axis Labels */}
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Effort: Low → High
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ transform: 'rotate(-90deg)' }}>
            Impact: Low → High
          </Typography>
        </Stack>
      </Paper>

      {/* Opportunity Scoring List */}
      <Typography variant="h6" gutterBottom>
        Score Opportunities
      </Typography>
      
      {opportunities.length === 0 ? (
        <Alert severity="info">
          No opportunities to prioritize yet. Complete the Discovery and Review phases first.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {opportunities.slice(0, 6).map((opportunity) => (
            <Grid item xs={12} md={6} key={opportunity.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {opportunity.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {opportunity.description}
                  </Typography>
                  
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Impact Score: 5
                      </Typography>
                      <Slider
                        value={5}
                        min={0}
                        max={10}
                        marks
                        valueLabelDisplay="auto"
                        color="primary"
                        onChange={() => {
                          // TODO: Handle impact score change
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Effort Score: 5
                      </Typography>
                      <Slider
                        value={5}
                        min={0}
                        max={10}
                        marks
                        valueLabelDisplay="auto"
                        color="secondary"
                        onChange={() => {
                          // TODO: Handle effort score change
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {opportunities.length > 6 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Showing first 6 opportunities. Full prioritization interface coming soon.
        </Alert>
      )}
    </Box>
  );
};