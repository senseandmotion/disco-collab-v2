import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  Avatar,
  Alert,
  Collapse
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Comment as CommentIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../utils/storage';
import type { Opportunity, Comment } from '../../types';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  open: boolean;
  onClose: () => void;
  readOnly?: boolean;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  open,
  onClose,
  readOnly = false
}) => {
  const { session, participants, refreshOpportunities } = useSession();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedSuccessVision, setEditedSuccessVision] = useState('');
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsExpanded, setCommentsExpanded] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (opportunity && open) {
      setEditedTitle(opportunity.title);
      setEditedDescription(opportunity.description);
      setEditedSuccessVision(opportunity.successVision);
      setIsEditing(false);
      
      // Load comments
      loadComments();
    }
  }, [opportunity, open]);

  const loadComments = () => {
    if (!opportunity) return;
    
    const opportunityComments = StorageService.getComments(opportunity.id);
    setComments(opportunityComments);
  };

  const getSubmitterName = () => {
    if (!opportunity) return 'Unknown';
    
    const submitter = participants.find(p => p.id === opportunity.submittedById);
    return submitter?.name || 'Unknown User';
  };

  const canEdit = () => {
    if (readOnly) return false;
    return user && opportunity && (
      user.id === opportunity.submittedById || 
      user.id === session?.teamLeadId
    );
  };

  const handleSaveEdit = () => {
    if (!opportunity || !session) return;

    try {
      const updatedOpportunity: Opportunity = {
        ...opportunity,
        title: editedTitle.trim(),
        description: editedDescription.trim(),
        successVision: editedSuccessVision.trim(),
        updatedAt: new Date().toISOString()
      };

      // Update in storage
      const opportunities = StorageService.getOpportunities(session.id);
      const updatedOpportunities = opportunities.map(opp => 
        opp.id === opportunity.id ? updatedOpportunity : opp
      );
      StorageService.saveOpportunities(session.id, updatedOpportunities);
      
      // Refresh context
      refreshOpportunities();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(opportunity?.title || '');
    setEditedDescription(opportunity?.description || '');
    setEditedSuccessVision(opportunity?.successVision || '');
    setIsEditing(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !opportunity || !user || !session) return;

    setIsSubmittingComment(true);

    try {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        opportunityId: opportunity.id,
        userId: user.id,
        content: newComment.trim(),
        reactions: {
          thumbsUp: [],
          thumbsDown: []
        },
        createdAt: new Date().toISOString()
      };

      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      StorageService.saveComments(opportunity.id, updatedComments);
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReaction = (commentId: string, reactionType: 'thumbsUp' | 'thumbsDown') => {
    if (!user) return;

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const reactions = { ...comment.reactions };
        
        // Remove user from both reaction types first
        reactions.thumbsUp = reactions.thumbsUp.filter(id => id !== user.id);
        reactions.thumbsDown = reactions.thumbsDown.filter(id => id !== user.id);
        
        // Add user to selected reaction type
        reactions[reactionType].push(user.id);
        
        return { ...comment, reactions };
      }
      return comment;
    });

    setComments(updatedComments);
    if (opportunity) {
      StorageService.saveComments(opportunity.id, updatedComments);
    }
  };

  const getUserReaction = (comment: Comment): 'thumbsUp' | 'thumbsDown' | null => {
    if (!user) return null;
    
    if (comment.reactions.thumbsUp.includes(user.id)) return 'thumbsUp';
    if (comment.reactions.thumbsDown.includes(user.id)) return 'thumbsDown';
    return null;
  };

  const getCommentAuthorName = (userId: string) => {
    const author = participants.find(p => p.id === userId);
    return author?.name || 'Unknown User';
  };

  if (!opportunity) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            {isEditing ? (
              <TextField
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                fullWidth
                variant="outlined"
                placeholder="Opportunity title"
              />
            ) : (
              <Typography variant="h6">{opportunity.title}</Typography>
            )}
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Chip 
                label={opportunity.status} 
                size="small" 
                color={opportunity.status === 'submitted' ? 'primary' : 'default'}
              />
              <Typography variant="caption" color="text.secondary">
                by {getSubmitterName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                • {new Date(opportunity.createdAt).toLocaleDateString()}
              </Typography>
            </Stack>
          </Box>
          
          <Stack direction="row" spacing={1}>
            {canEdit() && !isEditing && (
              <IconButton onClick={() => setIsEditing(true)} size="small">
                <EditIcon />
              </IconButton>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Description */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Description
            </Typography>
            {isEditing ? (
              <TextField
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                placeholder="Describe the opportunity..."
              />
            ) : (
              <Typography variant="body1" paragraph>
                {opportunity.description}
              </Typography>
            )}
          </Box>

          {/* Success Vision */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Success Vision
            </Typography>
            {isEditing ? (
              <TextField
                value={editedSuccessVision}
                onChange={(e) => setEditedSuccessVision(e.target.value)}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                placeholder="What would success look like?"
              />
            ) : (
              <Typography variant="body1" paragraph>
                {opportunity.successVision}
              </Typography>
            )}
          </Box>

          {/* AI Insights */}
          {opportunity.aiInsights && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                AI Insights
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Estimated Complexity
                      </Typography>
                      <Chip 
                        label={opportunity.aiInsights.estimatedComplexity} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    {opportunity.aiInsights.implementationConsiderations.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Implementation Considerations
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {opportunity.aiInsights.implementationConsiderations.map((consideration, index) => (
                            <li key={index}>
                              <Typography variant="body2">{consideration}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}

          <Divider />

          {/* Comments Section */}
          <Box>
            <Box 
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', mb: 2 }}
              onClick={() => setCommentsExpanded(!commentsExpanded)}
            >
              <CommentIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle2">
                Comments ({comments.length})
              </Typography>
              {commentsExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </Box>

            <Collapse in={commentsExpanded}>
              <Stack spacing={2}>
                {/* Comment List */}
                {comments.map((comment) => (
                  <Card key={comment.id} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">
                              {getCommentAuthorName(comment.userId)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" paragraph>
                            {comment.content}
                          </Typography>
                          
                          {/* Reactions */}
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<ThumbUpIcon />}
                              onClick={() => !readOnly && handleReaction(comment.id, 'thumbsUp')}
                              color={getUserReaction(comment) === 'thumbsUp' ? 'primary' : 'inherit'}
                              sx={{ minWidth: 'auto', p: 0.5 }}
                              disabled={readOnly}
                            >
                              {comment.reactions.thumbsUp.length}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<ThumbDownIcon />}
                              onClick={() => !readOnly && handleReaction(comment.id, 'thumbsDown')}
                              color={getUserReaction(comment) === 'thumbsDown' ? 'error' : 'inherit'}
                              sx={{ minWidth: 'auto', p: 0.5 }}
                              disabled={readOnly}
                            >
                              {comment.reactions.thumbsDown.length}
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Comment */}
                {user && !readOnly && (
                  <Card variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <TextField
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          multiline
                          rows={2}
                          fullWidth
                          size="small"
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isSubmittingComment}
                            variant="contained"
                            size="small"
                          >
                            {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                          </Button>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
                
                {readOnly && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Session is in Review phase. Opportunities are view-only until prioritization begins.
                  </Alert>
                )}
              </Stack>
            </Collapse>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleCancelEdit} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};