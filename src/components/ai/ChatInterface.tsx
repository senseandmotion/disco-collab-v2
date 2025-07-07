import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Collapse
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  Person as UserIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Lightbulb as SuggestionIcon
} from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import claudeService from '../../services/ClaudeAPIService';
import type { ChatMessage } from '../../types';

interface ChatInterfaceProps {
  onOpportunityExtracted?: (data: {
    title?: string;
    description?: string;
    successVision?: string;
  }) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onOpportunityExtracted }) => {
  const { session } = useSession();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Help me identify opportunities in our accounting processes",
    "What questions should I ask to find AI automation opportunities?",
    "How can we improve our month-end closing process?",
    "What are common pain points in financial reporting?",
    "Guide me through articulating a business problem"
  ];

  useEffect(() => {
    if (session && user) {
      loadChatHistory();
    }
  }, [session, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = () => {
    if (!session || !user) return;
    
    const history = StorageService.getChatMessages(session.id, user.id);
    setMessages(history);
  };

  const saveChatHistory = (newMessages: ChatMessage[]) => {
    if (!session || !user) return;
    
    StorageService.saveChatMessages(session.id, user.id, newMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || !session || !user || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: session.id,
      userId: user.id,
      userName: user.name,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      context: 'general-guidance'
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const sessionContext = `Session: ${session.name}, Phase: ${session.phase}, Participants: ${session.participants.length}`;
      const response = await claudeService.conductOpportunityInterview(
        sessionContext,
        text,
        newMessages.slice(-10)
      );

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sessionId: session.id,
        userId: 'ai',
        userName: 'AI Assistant',
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        context: 'general-guidance'
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);

      // Extract opportunity data if found
      if (response.contentExtractions && onOpportunityExtracted) {
        const { title, description, successVision } = response.contentExtractions;
        if (title || description || successVision) {
          onOpportunityExtracted({ title, description, successVision });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}-error`,
        sessionId: session.id,
        userId: 'ai',
        userName: 'AI Assistant',
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or continue without AI assistance.',
        timestamp: new Date().toISOString(),
        context: 'general-guidance'
      };

      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Simple formatting - split on double newlines for paragraphs
    return content.split('\n\n').map((paragraph, index) => (
      <Typography key={index} variant="body2" paragraph={index < content.split('\n\n').length - 1}>
        {paragraph}
      </Typography>
    ));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, pb: 1 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AIIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              AI Assistant Ready
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              I'm here to help you identify and articulate business opportunities. 
              Ask me questions or let me guide you through the discovery process.
            </Typography>
          </Box>
        )}

        {/* Suggestions */}
        {showSuggestions && messages.length === 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SuggestionIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Try asking:
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setShowSuggestions(!showSuggestions)}
                sx={{ ml: 'auto' }}
              >
                {showSuggestions ? <CollapseIcon /> : <ExpandIcon />}
              </IconButton>
            </Box>
            <Collapse in={showSuggestions}>
              <Stack spacing={1}>
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSendMessage(suggestion)}
                    sx={{ 
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Stack>
            </Collapse>
          </Box>
        )}

        {/* Message List */}
        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'flex-start',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <AIIcon sx={{ fontSize: 20 }} />
                </Avatar>
              )}
              
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  backgroundColor: message.role === 'user' ? 'primary.main' : 'background.paper',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
                }}
              >
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {message.userName}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6, ml: 1 }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
                {formatMessage(message.content)}
              </Paper>

              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: 'grey.400', width: 32, height: 32 }}>
                  <UserIcon sx={{ fontSize: 20 }} />
                </Avatar>
              )}
            </Stack>
          </Box>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 2 }}>
              <AIIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Stack>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>


      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            multiline
            maxRows={4}
            fullWidth
            variant="outlined"
            placeholder="Ask the AI assistant for guidance..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter to send • Shift+Enter for new line
        </Typography>
      </Box>
    </Box>
  );
};