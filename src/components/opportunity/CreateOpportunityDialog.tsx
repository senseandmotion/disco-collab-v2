import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as AIIcon,
  AutoAwesome as MagicIcon,
  Save as SaveIcon,
  Send as SubmitIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import claudeService from '../../services/ClaudeAPIService';
import type { Opportunity, ChatMessage } from '../../types';

interface CreateOpportunityDialogProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    title?: string;
    description?: string;
    successVision?: string;
  };
}

export const CreateOpportunityDialog: React.FC<CreateOpportunityDialogProps> = ({
  open,
  onClose,
  initialData
}) => {
  const { session, opportunities, refreshOpportunities } = useSession();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [successVision, setSuccessVision] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'draft' | 'submitted'>('draft');
  
  const [aiGuidanceOpen, setAiGuidanceOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setSuccessVision(initialData?.successVision || '');
      setCategory('');
      setStatus('draft');
      setErrors({});
      setChatHistory([]);
      setAiResponse('');
      setAiMessage('');
    }
  }, [open]);

  const handleAiAssistance = async () => {
    if (!aiMessage.trim() || !session || !user) return;

    setIsAiLoading(true);
    
    try {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId: session.id,
        userId: user.id,
        userName: user.name,
        role: 'user',
        content: aiMessage,
        timestamp: new Date().toISOString(),
        context: 'opportunity-creation'
      };

      const newHistory = [...chatHistory, userMessage];
      setChatHistory(newHistory);

      const sessionContext = `Session: ${session.name}, Phase: ${session.phase}. User is creating an opportunity.`;
      const response = await claudeService.conductOpportunityInterview(
        sessionContext,
        aiMessage,
        newHistory
      );

      const aiMessageObj: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sessionId: session.id,
        userId: 'ai',
        userName: 'AI Assistant',
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        context: 'opportunity-creation'
      };

      const updatedHistory = [...newHistory, aiMessageObj];
      setChatHistory(updatedHistory);
      setAiResponse(response.message);

      // Auto-populate fields if AI extracted information
      if (response.contentExtractions) {
        const { title: extractedTitle, description: extractedDesc, successVision: extractedSuccess } = response.contentExtractions;
        
        if (extractedTitle && !title) setTitle(extractedTitle);
        if (extractedDesc && !description) setDescription(extractedDesc);
        if (extractedSuccess && !successVision) setSuccessVision(extractedSuccess);
      }

      setAiMessage('');
    } catch (error) {
      console.error('AI assistance error:', error);
      setAiResponse('Sorry, I encountered an error. Please continue creating your opportunity manually.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!successVision.trim()) {
      newErrors.successVision = 'Success vision is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid without triggering state updates
  const isFormValid = useMemo(() => {
    return title.trim().length >= 5 && 
           description.trim().length >= 20 && 
           successVision.trim().length > 0;
  }, [title, description, successVision]);

  const handleSave = async (submitStatus: 'draft' | 'submitted') => {
    if (!validateForm() || !session || !user) return;

    setIsSaving(true);
    
    try {
      const newOpportunity: Opportunity = {
        id: uuidv4(),
        sessionId: session.id,
        title: title.trim(),
        description: description.trim(),
        successVision: successVision.trim(),
        submittedById: user.id,
        status: submitStatus,
        categoryId: category || undefined,
        scores: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save opportunity
      const updatedOpportunities = [...opportunities, newOpportunity];
      StorageService.saveOpportunities(session.id, updatedOpportunities);

      // Refresh opportunities in session context
      refreshOpportunities();

      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      setErrors({ submit: 'Failed to save opportunity. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleAiAssistance();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Create New Opportunity
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Left Panel - Form */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <TextField
                label="Opportunity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Automate month-end reconciliation process"
                error={!!errors.title}
                helperText={errors.title || 'A clear, specific title for this opportunity'}
                fullWidth
                required
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the current challenge and what you'd like to improve..."
                error={!!errors.description}
                helperText={errors.description || 'Explain the problem, current process, and desired outcome'}
                multiline
                rows={4}
                fullWidth
                required
              />

              <TextField
                label="Success Vision"
                value={successVision}
                onChange={(e) => setSuccessVision(e.target.value)}
                placeholder="What would success look like? How would you measure it?"
                error={!!errors.successVision}
                helperText={errors.successVision || 'Define what success looks like and how you\'ll measure it'}
                multiline
                rows={3}
                fullWidth
                required
              />

              <TextField
                label="Category (Optional)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Process Automation, Data Analytics, Communication"
                helperText="Help organize opportunities by theme"
                fullWidth
              />

              {errors.submit && (
                <Alert severity="error">{errors.submit}</Alert>
              )}
            </Stack>
          </Grid>

          {/* Right Panel - AI Guidance */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  cursor: 'pointer'
                }}
                onClick={() => setAiGuidanceOpen(!aiGuidanceOpen)}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AIIcon color="primary" />
                    <Typography variant="h6">AI Guidance</Typography>
                    {!claudeService.isAPIAvailable() && (
                      <Chip label="Demo Mode" size="small" color="warning" />
                    )}
                  </Stack>
                  {aiGuidanceOpen ? <CollapseIcon /> : <ExpandIcon />}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Get help crafting your opportunity
                </Typography>
              </Box>

              <Collapse in={aiGuidanceOpen} sx={{ flexGrow: 1 }}>
                <Box sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
                  {/* AI Chat Area */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    {chatHistory.length === 0 && !aiResponse && (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <MagicIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Ask me to help you think through your opportunity:
                        </Typography>
                        <Stack spacing={1}>
                          {[
                            "Help me identify the root problem",
                            "What questions should I consider?",
                            "How can I make this more specific?",
                            "What would good success metrics be?"
                          ].map((suggestion, index) => (
                            <Button
                              key={index}
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setAiMessage(suggestion);
                                // Auto-submit the suggestion
                                setTimeout(() => handleAiAssistance(), 100);
                              }}
                              sx={{ textTransform: 'none' }}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Chat Messages */}
                    {chatHistory.map((msg) => (
                      <Box key={msg.id} sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {msg.userName}:
                        </Typography>
                        <Box 
                          sx={{ 
                            p: 1.5, 
                            borderRadius: 1,
                            backgroundColor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                            color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary'
                          }}
                        >
                          <Typography variant="body2">{msg.content}</Typography>
                        </Box>
                      </Box>
                    ))}

                    {isAiLoading && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                          AI is thinking...
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* AI Input */}
                  <Stack direction="row" spacing={1}>
                    <TextField
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      placeholder="Ask for help with your opportunity..."
                      size="small"
                      fullWidth
                      onKeyPress={handleKeyPress}
                      disabled={isAiLoading}
                    />
                    <IconButton
                      onClick={handleAiAssistance}
                      disabled={!aiMessage.trim() || isAiLoading}
                      color="primary"
                    >
                      <AIIcon />
                    </IconButton>
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={() => handleSave('draft')}
          disabled={isSaving || !title.trim()}
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          Save Draft
        </Button>
        <Button
          onClick={() => handleSave('submitted')}
          disabled={isSaving || !isFormValid}
          variant="contained"
          startIcon={isSaving ? <CircularProgress size={20} /> : <SubmitIcon />}
        >
          Submit Opportunity
        </Button>
      </DialogActions>
    </Dialog>
  );
};