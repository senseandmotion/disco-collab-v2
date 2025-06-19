import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Button,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { getChatResponse, getDefineResponse } from '../../services/AIService';
import { useAppContext } from '../../context/AppContext';
import { Opportunity } from '../../types';

interface AIChatProps {
  promptType: 'contextAnalysis' | 'challengeIdentification' | 'prioritization' | 'briefGeneration' | 'defineAssistant' | 'getStarted';
  contextData?: Record<string, any>;
  onResponse?: (response: any) => void;
  onDownloadBrief?: () => void;
  onRegenerateBrief?: () => void;
  onGenerateStatement?: () => void;
  placeholder?: string;
  step?: number;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC<AIChatProps> = ({
  promptType,
  contextData = {},
  onResponse,
  onDownloadBrief,
  onRegenerateBrief,
  onGenerateStatement,
  placeholder = 'Type your message here...'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, currentSession, opportunities, addOpportunity } = useAppContext();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedOpportunity, setSuggestedOpportunity] = useState<Partial<Opportunity> | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [refineContext, setRefineContext] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      if (welcomeMessage) {
        setMessages([{
          role: 'ai',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getWelcomeMessage = () => {
    switch (promptType) {
      case 'challengeIdentification':
        return "Let's identify key challenges and opportunities in your organization. What specific problems or inefficiencies have you noticed?";
      case 'defineAssistant':
        return "I'll help you refine and define your selected challenge. Let's create a clear problem statement and success criteria.";
      case 'briefGeneration':
        return "Let's generate a comprehensive brief for your challenge. What are your thoughts on success criteria?";
      default:
        return null;
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    let apiMessage = userMessage;

    if (selectedQuestion) {
      apiMessage = `Regarding "${selectedQuestion}": ${userMessage}`;
    } else if (refineContext) {
      apiMessage = `I'd like to refine the brief for "${refineContext}": ${userMessage}`;
    }

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setInput('');
    setSelectedQuestion(null);
    setRefineContext(null);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let aiResponse = '';
      
      if (promptType === 'challengeIdentification') {
        const response = await getChatResponse({
          organization: currentSession?.name || '',
          industry: contextData.industry || '',
          userRole: currentUser?.role || 'contributor',
          aiStance: contextData.aiStance || 'moderate',
          organizationContext: contextData.organizationContext || '',
          previousOpportunities: opportunities.map(o => `${o.title}: ${o.description}`).join('\n'),
          conversationHistory: messages,
          userMessage: apiMessage
        });
        aiResponse = response;
      } else if (promptType === 'defineAssistant') {
        const response = await getDefineResponse({
          organization: currentSession?.name || '',
          industry: contextData.industry || '',
          selectedChallenge: contextData.selectedChallenge || '',
          currentBrief: contextData.currentBrief || '',
          successVision: contextData.successVision || '',
          conversationHistory: JSON.stringify(messages),
          userMessage: apiMessage
        });
        aiResponse = response;
      } else {
        aiResponse = "I'm here to help you identify and define business challenges. How can I assist you today?";
      }

      setIsTyping(false);
      
      // Add AI response
      setMessages(prev => [...prev, {
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);

      // Extract any opportunities from response
      extractOpportunityFromResponse(aiResponse);

      if (onResponse) {
        onResponse({ userMessage, aiResponse });
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractOpportunityFromResponse = (response: string) => {
    // Simple pattern matching for opportunity extraction
    const titleMatch = response.match(/\*\*Title:\*\*\s*(.+)/);
    const descriptionMatch = response.match(/\*\*Description:\*\*\s*(.+)/);
    const categoryMatch = response.match(/\*\*Category:\*\*\s*(.+)/);

    if (titleMatch && descriptionMatch) {
      setSuggestedOpportunity({
        title: titleMatch[1].trim(),
        description: descriptionMatch[1].trim(),
        category: categoryMatch?.[1].trim() || 'general'
      });
    }
  };

  const handleAcceptOpportunity = () => {
    if (suggestedOpportunity && currentSession) {
      const newOpportunity: Opportunity = {
        id: `opp-${Date.now()}`,
        sessionId: currentSession.id,
        title: suggestedOpportunity.title || '',
        description: suggestedOpportunity.description || '',
        submittedBy: currentUser?.id || '',
        submittedAt: new Date(),
        category: suggestedOpportunity.category,
        status: 'submitted'
      };
      
      addOpportunity(newOpportunity);
      setSuggestedOpportunity(null);
      
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `Great! I've added "${newOpportunity.title}" to your opportunity list.`,
        timestamp: new Date()
      }]);
    }
  };

  const handleDeclineOpportunity = () => {
    setSuggestedOpportunity(null);
    setMessages(prev => [...prev, {
      role: 'ai',
      content: 'No problem! Feel free to share other challenges you\'d like to explore.',
      timestamp: new Date()
    }]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Messages */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: 'text.secondary'
          }}>
            <SmartToyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              Initializing AI assistant...
            </Typography>
          </Box>
        )}

        {messages.map((message, index) => (
          <Fade in key={index}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2,
                  boxShadow: theme.shadows[2]
                }}
              >
                {message.role === 'ai' && (
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.8 }}>
                    AI Assistant
                  </Typography>
                )}
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          </Fade>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[0, 150, 300].map((delay) => (
                <Box
                  key={delay}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'text.secondary',
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: `${delay}ms`,
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { transform: 'scale(0)' },
                      '40%': { transform: 'scale(1)' }
                    }
                  }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary">
              AI is thinking...
            </Typography>
          </Box>
        )}

        {/* Suggested Opportunity Card */}
        {suggestedOpportunity && (
          <Collapse in>
            <Card sx={{ bgcolor: 'info.lighter', borderColor: 'info.main', borderWidth: 1, borderStyle: 'solid' }}>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="info.main" gutterBottom>
                      Opportunity Identified
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {suggestedOpportunity.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {suggestedOpportunity.description}
                    </Typography>
                    {suggestedOpportunity.category && (
                      <Chip 
                        label={suggestedOpportunity.category} 
                        size="small" 
                        sx={{ mt: 1 }}
                        color="info"
                      />
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={handleAcceptOpportunity}
                    >
                      Add to List
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={handleDeclineOpportunity}
                    >
                      Not Now
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Collapse>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper 
        component="form" 
        onSubmit={handleSendMessage}
        elevation={3}
        sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        {/* Selected Question or Refine Context */}
        {(selectedQuestion || refineContext) && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedQuestion(null);
                  setRefineContext(null);
                }}
              >
                <CloseIcon />
              </IconButton>
            }
          >
            <Typography variant="body2">
              {selectedQuestion ? `Answering: ${selectedQuestion}` : `Refining: "${refineContext}"`}
            </Typography>
          </Alert>
        )}

        {/* Generate Statement Button */}
        {promptType === 'challengeIdentification' && onGenerateStatement && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DescriptionIcon />}
              onClick={onGenerateStatement}
              fullWidth={isMobile}
            >
              Generate Opportunity Statement
            </Button>
          </Box>
        )}

        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={placeholder}
            disabled={isLoading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={!input.trim() || isLoading}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground'
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AIChat;