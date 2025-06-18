import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useCollaborativeDiscovery } from '../../context/CollaborativeDiscoveryContext';
import { useAppContext } from '../../context/AppContext';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  selectedOpportunityId?: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, selectedOpportunityId }) => {
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'email'>('txt');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const { downloadSessionBrief, exportSessionData, briefs } = useCollaborativeDiscovery();
  const { currentSession, opportunities } = useAppContext();

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      if (exportFormat === 'txt') {
        await downloadSessionBrief('txt');
      } else if (exportFormat === 'json') {
        const data = await exportSessionData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `discovery-session-${currentSession?.code}-data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'email') {
        // Email functionality would integrate with backend
        console.log('Email export would be sent to Sense & Motion');
      }
      
      setExportSuccess(true);
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportContent = () => {
    if (selectedOpportunityId) {
      const opportunity = opportunities.find(o => o.id === selectedOpportunityId);
      const brief = briefs.find(b => b.opportunityId === selectedOpportunityId);
      
      if (!opportunity || !brief) return 'No content available';
      
      return `DISCOVERY BRIEF
${opportunity.title}

PROBLEM STATEMENT:
${brief.problemStatement}

OPPORTUNITY:
${brief.opportunity}

SUCCESS INDICATORS:
${brief.successIndicators.map(si => `• ${si}`).join('\n')}

NEXT STEPS:
${brief.nextSteps.map(ns => `• ${ns}`).join('\n')}`;
    }
    
    return `Full session export with ${opportunities.length} opportunities and ${briefs.length} briefs`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Discovery Session</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose how you'd like to export your discovery session:
          </Typography>
          
          <RadioGroup
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'txt' | 'json' | 'email')}
            sx={{ my: 3 }}
          >
            <FormControlLabel
              value="txt"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Text Document (.txt)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Human-readable format for sharing and review
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="json"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Data Export (.json)</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Complete session data for import or analysis
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="email"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Send to Sense & Motion</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Get expert consultation on your discovery findings
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              {getExportContent().substring(0, 150)}...
            </Typography>
          </Alert>
          
          {exportSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Export completed successfully!
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={isExporting}
          startIcon={isExporting ? <CircularProgress size={20} /> : 
                    exportFormat === 'email' ? <EmailIcon /> : <DownloadIcon />}
        >
          {isExporting ? 'Exporting...' : 
           exportFormat === 'email' ? 'Send Email' : 'Download'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};