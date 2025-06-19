import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface EditableSummaryProps {
  initialContent: string;
  onSave: (content: string) => void;
  placeholder?: string;
  title?: string;
  subtext?: string;
  sx?: object;
}

const EditableSummary: React.FC<EditableSummaryProps> = ({
  initialContent,
  onSave,
  placeholder = 'Click edit to add content...',
  title = '',
  subtext = '',
  sx = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  
  // Update local content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);
  
  const handleSave = () => {
    onSave(content);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setContent(initialContent);
    setIsEditing(false);
  };
  
  return (
    <Box sx={sx}>
      {title && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="text.primary">
            {title}
          </Typography>
          {subtext && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtext}
            </Typography>
          )}
        </Box>
      )}
      
      {isEditing ? (
        <Stack spacing={2}>
          <TextField
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={4}
            fullWidth
            placeholder={placeholder}
            autoFocus
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
              }
            }}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              startIcon={<CheckIcon />}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            minHeight: 80,
            position: 'relative',
            bgcolor: 'background.paper',
            '&:hover': {
              '& .edit-button': {
                opacity: 1,
              }
            }
          }}
        >
          {content ? (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-line',
                color: 'text.primary',
                lineHeight: 1.6,
              }}
            >
              {content}
            </Typography>
          ) : (
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
              }}
            >
              {placeholder}
            </Typography>
          )}
          <IconButton
            className="edit-button"
            size="small"
            onClick={() => setIsEditing(true)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': {
                bgcolor: 'primary.lighter',
              }
            }}
            title="Edit content"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}
    </Box>
  );
};

export default EditableSummary;