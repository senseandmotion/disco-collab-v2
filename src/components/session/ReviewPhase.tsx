import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  Badge
} from '@mui/material';
import { 
  SmartToy as AIIcon,
  Assignment as AssignIcon,
  CheckCircle as ApproveIcon,
  Info as InfoIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Merge as MergeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useSession } from '../../context/SessionContext';
import { OpportunityDetailModal } from '../opportunity/OpportunityDetailModal';
import { CategoryManagementDialog } from './CategoryManagementDialog';
import { DeciderAssignmentDialog } from './DeciderAssignmentDialog';
import { StorageService } from '../../utils/storage';
import ClaudeAPIService from '../../services/ClaudeAPIService';
import type { Opportunity, OpportunityCategory } from '../../types';
import type { CategoryAnalysis } from '../../services/ClaudeAPIService';

export const ReviewPhase: React.FC = () => {
  const { session, opportunities, participants, isTeamLead, isDecider } = useSession();
  const [contributorDialogOpen, setContributorDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [categories, setCategories] = useState<OpportunityCategory[]>([]);
  const [mergeRecommendations, setMergeRecommendations] = useState<CategoryAnalysis['mergeRecommendations']>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deciderDialogOpen, setDeciderDialogOpen] = useState(false);

  // Show dialog for contributors when they first enter review phase
  useEffect(() => {
    if (!isTeamLead && !isDecider) {
      setContributorDialogOpen(true);
    }
  }, [isTeamLead, isDecider]);

  // Load categories from storage
  useEffect(() => {
    if (session && isTeamLead) {
      const storedCategories = StorageService.getCategories(session.id);
      if (storedCategories.length > 0) {
        setCategories(storedCategories);
        setHasAnalyzed(true);
      }
    }
  }, [session, isTeamLead]);

  const handleGenerateCategories = async () => {
    if (!session) return;
    
    setIsAnalyzing(true);
    try {
      const submittedOpportunities = opportunities.filter(opp => 
        opp.status === 'submitted' || opp.status === 'approved'
      );
      
      const analysis = await ClaudeAPIService.analyzeOpportunitiesForClustering(submittedOpportunities);
      
      setCategories(analysis.categories);
      setMergeRecommendations(analysis.mergeRecommendations);
      setHasAnalyzed(true);
      
      // Save categories to storage
      StorageService.saveCategories(session.id, analysis.categories);
      
      // Expand all categories by default
      setExpandedCategories(new Set(analysis.categories.map(cat => cat.id)));
    } catch (error) {
      console.error('Error generating categories:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getOpportunityById = (id: string): Opportunity | undefined => {
    return opportunities.find(opp => opp.id === id);
  };

  const handleEditCategory = (category: OpportunityCategory) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = (updatedCategory: OpportunityCategory) => {
    setCategories(prev => prev.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
  };

  const handleAssignDecider = (category: OpportunityCategory) => {
    setSelectedCategory(category);
    setDeciderDialogOpen(true);
  };

  const handleDeciderAssigned = (deciderId: string) => {
    if (!selectedCategory || !session) return;
    
    const updatedCategory = {
      ...selectedCategory,
      assignedDeciderId: deciderId,
      approvalStatus: 'pending' as const
    };
    
    StorageService.updateCategory(session.id, selectedCategory.id, updatedCategory);
    setCategories(prev => prev.map(cat => 
      cat.id === selectedCategory.id ? updatedCategory : cat
    ));
  };

  // Contributor view - read-only opportunities
  if (!isTeamLead && !isDecider) {
    const submittedOpportunities = opportunities.filter(opp => opp.status === 'submitted' || opp.status === 'approved');

    return (
      <Box>
        {/* Review Phase Information Dialog */}
        <Dialog 
          open={contributorDialogOpen}
          onClose={() => setContributorDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            Session is now in Review
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              The discovery phase has ended and your team lead is now reviewing all submitted opportunities.
            </Typography>
            <Typography variant="body1" paragraph>
              You can continue to view all submitted opportunities below, but no new opportunities can be added at this time.
            </Typography>
            <Typography variant="body1">
              You'll be notified by email when it's time to prioritize opportunities in the next phase.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setContributorDialogOpen(false)} variant="contained">
              Got it
            </Button>
          </DialogActions>
        </Dialog>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Review Phase
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review all submitted opportunities while the team lead organizes them for prioritization.
          </Typography>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6">{submittedOpportunities.length}</Typography>
              <Typography variant="body2" color="text.secondary">Submitted Opportunities</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6">{opportunities.filter(o => o.status === 'approved').length}</Typography>
              <Typography variant="body2" color="text.secondary">Approved</Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Read-only Opportunities */}
        {submittedOpportunities.length === 0 ? (
          <Alert severity="info">
            No opportunities have been submitted yet.
          </Alert>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Submitted Opportunities
            </Typography>
            {submittedOpportunities.map((opportunity) => (
              <Card 
                key={opportunity.id} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
                onClick={() => setSelectedOpportunity(opportunity)}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="h6">
                      {opportunity.title}
                    </Typography>
                    <Chip 
                      label={opportunity.status} 
                      size="small" 
                      color={opportunity.status === 'approved' ? 'success' : 'default'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {opportunity.description.length > 150 
                      ? `${opportunity.description.substring(0, 150)}...`
                      : opportunity.description
                    }
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(opportunity.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • Click to view details
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Opportunity Detail Modal */}
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          open={!!selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          readOnly={true}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Review Phase
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review AI categorizations, assign Deciders, and approve opportunity groupings.
          </Typography>
        </Box>
        {isTeamLead && (
          <Button
            variant="outlined"
            startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AIIcon />}
            onClick={handleGenerateCategories}
            disabled={isAnalyzing || opportunities.filter(o => o.status === 'submitted').length === 0}
          >
            {isAnalyzing ? 'Analyzing...' : hasAnalyzed ? 'Regenerate Categories' : 'Generate AI Categories'}
          </Button>
        )}
      </Stack>

      {/* Review Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">{opportunities.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Opportunities</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">{categories.length}</Typography>
            <Typography variant="body2" color="text.secondary">Categories</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6">{categories.filter(cat => cat.assignedDeciderId).length}</Typography>
            <Typography variant="body2" color="text.secondary">Assigned Deciders</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* AI Categories Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">AI-Generated Categories</Typography>
            <Chip 
              label={hasAnalyzed ? `${categories.length} Categories` : "Not Generated"} 
              color={hasAnalyzed ? "success" : "default"} 
              size="small" 
            />
          </Stack>
          
          {!hasAnalyzed ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  AI will analyze all submitted opportunities and suggest logical groupings and potential mergers.
                  This helps organize similar ideas and reduce duplication.
                </Typography>
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Click "Generate AI Categories" to start the analysis.
              </Typography>
            </>
          ) : (
            <Stack spacing={2}>
              {/* Merge Recommendations */}
              {mergeRecommendations.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Potential Duplicates Found
                  </Typography>
                  <Typography variant="body2">
                    AI identified {mergeRecommendations.length} sets of opportunities that may be duplicates.
                  </Typography>
                </Alert>
              )}

              {/* Categories */}
              {categories.map((category) => (
                <Card key={category.id} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flexGrow: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => toggleCategory(category.id)}
                          >
                            {expandedCategories.has(category.id) ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                          <Typography variant="subtitle1">{category.name}</Typography>
                          <Badge badgeContent={category.opportunityIds.length} color="primary" />
                          <Chip 
                            label={`${category.aiConfidence} confidence`} 
                            size="small" 
                            color={
                              category.aiConfidence === 'high' ? 'success' : 
                              category.aiConfidence === 'medium' ? 'warning' : 'default'
                            }
                          />
                          {category.assignedDeciderId && (
                            <Chip 
                              label={`Assigned: ${participants.find(p => p.id === category.assignedDeciderId)?.name || 'Unknown'}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              icon={<PersonIcon />}
                            />
                          )}
                        </Stack>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                          {category.description}
                        </Typography>
                        
                        {expandedCategories.has(category.id) && (
                          <Box sx={{ mt: 2, ml: 5 }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              AI Reasoning: {category.aiReasoning}
                            </Typography>
                            
                            <List dense sx={{ mt: 1 }}>
                              {category.opportunityIds.map(oppId => {
                                const opp = getOpportunityById(oppId);
                                if (!opp) return null;
                                
                                return (
                                  <ListItem 
                                    key={oppId}
                                    secondaryAction={
                                      <Button 
                                        size="small" 
                                        onClick={() => setSelectedOpportunity(opp)}
                                      >
                                        View
                                      </Button>
                                    }
                                  >
                                    <ListItemText 
                                      primary={opp.title}
                                      secondary={`${opp.description.substring(0, 100)}...`}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          </Box>
                        )}
                      </Box>
                      
                      <Stack direction="row" spacing={1}>
                        <IconButton 
                          size="small"
                          onClick={() => handleEditCategory(category)}
                          title="Edit category"
                        >
                          <EditIcon />
                        </IconButton>
                        <Button 
                          size="small" 
                          startIcon={<AssignIcon />}
                          variant={category.assignedDeciderId ? "outlined" : "contained"}
                          onClick={() => handleAssignDecider(category)}
                        >
                          {category.assignedDeciderId ? 'Reassign' : 'Assign Decider'}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Decider Assignment Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Decider Assignments
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Assign team members as Deciders for specific opportunities or categories. 
              Deciders will review and approve AI recommendations.
            </Typography>
          </Alert>
          
          {opportunities.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No opportunities to assign yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {opportunities.slice(0, 3).map((opportunity) => (
                <Card key={opportunity.id} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2">{opportunity.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opportunity.assignedDeciderId ? 'Assigned' : 'Unassigned'}
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        startIcon={<AssignIcon />}
                        variant={opportunity.assignedDeciderId ? "outlined" : "contained"}
                      >
                        {opportunity.assignedDeciderId ? 'Reassign' : 'Assign Decider'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              {opportunities.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  And {opportunities.length - 3} more opportunities...
                </Typography>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Progress Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Review Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track completion of categorization and assignment tasks.
          </Typography>
          {/* Progress indicators will go here */}
        </CardContent>
      </Card>

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        open={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        readOnly={false}
      />

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSave={handleSaveCategory}
        opportunities={opportunities}
      />

      {/* Decider Assignment Dialog */}
      <DeciderAssignmentDialog
        open={deciderDialogOpen}
        onClose={() => {
          setDeciderDialogOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory || undefined}
        onAssign={handleDeciderAssigned}
      />
    </Box>
  );
};