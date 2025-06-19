import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { OrganizationResearchResult } from '../services/AIService';
import { initializeIndustry, storeIndustryPreference } from '../services/queryStringHandler';
import { useAnalytics } from '../hooks/useAnalytics';

// Types for organizational challenge
interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  value: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  position?: { x: number; y: number };
  briefCompleted?: boolean;
  brief?: Brief;
}

// Chat message type
interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

// Interface for Brief
interface Brief {
  problemStatement: string;
  opportunity: string;
  successIndicators: string[];
}

// State interface for better type safety
interface DiscoveryState {
  selectedIndustryKey: string | null; // Industry from query string (e.g., 'proservices')
  userData: {
    name: string;
    email: string;
    role: string;
    organization: string;
    organizationDescription: string;
    industry: string;
    subIndustry?: string; // Specific area within industry (e.g., 'legal', 'accounting')
    aiStance: 'cutting-edge' | 'moderate' | 'conservative' | '';
    innovationCulture: string;
    aiSentiment: string;
    organizationResearch?: OrganizationResearchResult;
    discoveryPreferences?: UserPreferences;
  };
  contextSummary: string;
  contextBullets: string[];
  interactionMode: 'open' | 'guided';
  selectedFramework: string;
  challenges: Challenge[];
  successVision: string;
  selectedKPIs: string[];
  availableKPIs: string[];
  isGeneratingBrief: boolean;
  briefError: string | null;
  currentStep: number;
  visitedSteps: number[];
  conversationHistory: ChatMessage[];
}

// User preferences interface
interface UserPreferences {
  timeCommitment: 'express' | 'focused' | 'comprehensive' | '';
  detailLevel: 'essentials' | 'guided' | 'deep' | '';
  industryTemplates: boolean;
}

// Types for our context state
interface DiscoveryContextType {
  // Industry context
  selectedIndustryKey: string | null;
  setSelectedIndustryKey: (industryKey: string | null) => void;
  
  // Step 1: Context
  userData: {
    name: string;
    email: string;
    role: string;
    organization: string;
    organizationDescription: string;
    industry: string;
    subIndustry?: string;
    aiStance: 'cutting-edge' | 'moderate' | 'conservative' | '';
    innovationCulture: string;
    aiSentiment: string;
    organizationResearch?: OrganizationResearchResult;
    discoveryPreferences?: UserPreferences;
  };
  setUserData: (data: Partial<DiscoveryContextType['userData']>) => void;
  
  // Context summary
  contextSummary: string;
  setContextSummary: (summary: string) => void;
  contextBullets: string[];
  setContextBullets: (bullets: string[]) => void;
  
  // Step 2: Identification
  interactionMode: 'open' | 'guided';
  setInteractionMode: (mode: 'open' | 'guided') => void;
  selectedFramework: string;
  setSelectedFramework: (framework: string) => void;
  challenges: Challenge[];
  addChallenge: (challenge: Omit<Challenge, 'id'>) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  removeChallenge: (id: string) => void;
  reorderChallenges: (oldIndex: number, newIndex: number) => void;
  
  // Step 3: Prioritization (integrated into Step 3)
  updateChallengePosition: (id: string, position: { x: number; y: number }) => void;
  updateChallengeRating: (id: string, key: 'value' | 'effort', value: 'high' | 'medium' | 'low') => void;
  
  // Step 4: Deep Dive (now Step 4)
  successVision: string;
  setSuccessVision: (vision: string) => void;
  selectedKPIs: string[];
  setSelectedKPIs: (kpis: string[]) => void;
  availableKPIs: string[];
  setAvailableKPIs: (kpis: string[]) => void;
  addBriefToChallenge: (challengeId: string, brief: Brief) => void;
  getBriefForChallenge: (challengeId: string) => Brief | null;
  isGeneratingBrief: boolean;
  setIsGeneratingBrief: (isGenerating: boolean) => void;
  briefError: string | null;
  setBriefError: (error: string | null) => void;
  
  // Navigation
  currentStep: number;
  setCurrentStep: (step: number) => void;
  visitedSteps: number[];
  addVisitedStep: (step: number) => void;
  
  // Step completion tracking
  isStepCompleted: (step: number) => boolean;
  isStepVisited: (step: number) => boolean;
  canNavigateToStep: (step: number) => boolean;
  
  // Unified conversation history across all steps
  conversationHistory: ChatMessage[];
  addToConversation: (role: 'user' | 'ai', content: string) => void;
  getUnifiedChatHistory: () => ChatMessage[];
  initializeChat: (initialMessage?: string) => void;
  
  // Reset
  resetDiscovery: () => void;
}

// Initial state
const initialState: DiscoveryState = {
  selectedIndustryKey: null,
  userData: {
    name: '',
    email: '',
    role: '',
    organization: '',
    organizationDescription: '',
    industry: '',
    aiStance: '',
    innovationCulture: '',
    aiSentiment: '',
    organizationResearch: undefined,
    discoveryPreferences: {
      timeCommitment: 'express',
      detailLevel: 'essentials',
      industryTemplates: true
    },
  },
  contextSummary: '',
  contextBullets: [],
  interactionMode: 'guided',
  selectedFramework: 'jtbd',
  challenges: [],
  successVision: '',
  selectedKPIs: [],
  availableKPIs: [],
  isGeneratingBrief: false,
  briefError: null,
  currentStep: 1,
  visitedSteps: [1], // Start with step 1 visited
  conversationHistory: [],
};

const DiscoveryContext = createContext<DiscoveryContextType | undefined>(undefined);

export const DiscoveryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Flag to prevent saving during reset
  const isResettingRef = useRef(false);
  
  // Analytics hook
  const analytics = useAnalytics();
  
  // Use local storage to restore state
  const loadFromLocalStorage = (): DiscoveryState => {
    try {
      const savedState = localStorage.getItem('discoveryState');
      if (!savedState) return initialState;
      
      let parsedState = JSON.parse(savedState);
      
      // Ensure all properties from initialState exist in parsedState
      parsedState = { ...initialState, ...parsedState };
      
      // Explicitly check and initialize critical properties
      
      if (!Array.isArray(parsedState.conversationHistory)) {
        parsedState.conversationHistory = [];
      }
      
      if (!Array.isArray(parsedState.challenges)) {
        parsedState.challenges = [];
      }
      
      if (!Array.isArray(parsedState.selectedKPIs)) {
        parsedState.selectedKPIs = [];
      }
      
      if (!Array.isArray(parsedState.contextBullets)) {
        parsedState.contextBullets = [];
      }
      
      // Initialize visitedSteps if it doesn't exist
      if (!Array.isArray(parsedState.visitedSteps)) {
        parsedState.visitedSteps = [1]; // Start with step 1 visited
      }
      
      // Ensure userData is properly initialized
      if (!parsedState.userData || typeof parsedState.userData !== 'object') {
        parsedState.userData = initialState.userData;
      } else {
        // Ensure all userData properties exist
        parsedState.userData = { ...initialState.userData, ...parsedState.userData };
      }
      
      // Clean up deprecated properties
      delete parsedState.prioritizedChallenges;
      delete parsedState.selectedChallenge;
      
      return parsedState;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialState;
    }
  };

  const [state, setState] = useState<DiscoveryState>(loadFromLocalStorage);
  const saveTimeoutRef = useRef<number | null>(null);

  // Initialize industry from query string on first load
  useEffect(() => {
    const industryKey = initializeIndustry();
    if (industryKey && industryKey !== state.selectedIndustryKey) {
      setState(prevState => ({
        ...prevState,
        selectedIndustryKey: industryKey
      }));
    }
  }, []); // Run only once on mount

  // One-time cleanup for existing challenges with duplicate IDs
  useEffect(() => {
    const fixDuplicateIds = () => {
      setState((prevState: DiscoveryState) => {
        const seenIds = new Set<string>();
        const updatedChallenges = prevState.challenges.map((challenge, index) => {
          if (seenIds.has(challenge.id)) {
            // Generate a new unique ID for duplicate
            const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`;
            console.log(`Fixed duplicate challenge ID: ${challenge.id} -> ${newId}`);
            return { ...challenge, id: newId };
          }
          seenIds.add(challenge.id);
          return challenge;
        });
        
        // Only update state if we found duplicates
        if (updatedChallenges.some((challenge, index) => challenge.id !== prevState.challenges[index]?.id)) {
          console.log('Fixed duplicate challenge IDs');
          return { ...prevState, challenges: updatedChallenges };
        }
        
        return prevState;
      });
    };

    // Run the cleanup on mount
    fixDuplicateIds();
  }, []); // Empty dependency array - only run once on mount

  // Save state to local storage when it changes
  useEffect(() => {
    // Don't save if we're in the middle of a reset
    if (isResettingRef.current) {
      return;
    }
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('discoveryState', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }, 500); // Save after 500ms of no changes
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  // Helper functions to update state
  const setSelectedIndustryKey = (industryKey: string | null) => {
    setState((prevState: DiscoveryState) => ({
      ...prevState,
      selectedIndustryKey: industryKey
    }));
    // Store in localStorage when changed
    if (industryKey) {
      storeIndustryPreference(industryKey);
    }
  };

  const setUserData = (data: Partial<DiscoveryContextType['userData']>) => {
    setState((prevState: DiscoveryState) => {
      const newUserData = { ...prevState.userData, ...data };
      
      // Track user profile completion when we have name, org, and role
      if (newUserData.name && newUserData.organization && newUserData.role && 
          (!prevState.userData.name || !prevState.userData.organization || !prevState.userData.role)) {
        analytics.trackUserProfile({
          name: newUserData.name,
          organization: newUserData.organization,
          role: newUserData.role
        });
      }
      
      return {
        ...prevState,
        userData: newUserData
      };
    });
  };

  const setContextSummary = (summary: string) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, contextSummary: summary }));
  };

  const setContextBullets = (bullets: string[]) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, contextBullets: bullets }));
  };

  const setInteractionMode = (mode: 'open' | 'guided') => {
    setState((prevState: DiscoveryState) => ({ ...prevState, interactionMode: mode }));
  };

  const setSelectedFramework = (framework: string) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, selectedFramework: framework }));
  };

  const addChallenge = (challenge: Omit<Challenge, 'id'>) => {
    const newChallenge = {
      ...challenge,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setState((prevState: DiscoveryState) => ({
      ...prevState,
      challenges: [...prevState.challenges, newChallenge]
    }));
    
    // Track challenge addition
    analytics.trackChallengeAction('added', challenge.title);
  };

  const updateChallenge = (id: string, updates: Partial<Challenge>) => {
    setState((prevState: DiscoveryState) => {
      const updatedChallenges = prevState.challenges.map((challenge: Challenge) =>
        challenge.id === id ? { ...challenge, ...updates } : challenge
      );
      
      // Track challenge edit if title or description was updated
      if (updates.title || updates.description) {
        const challenge = prevState.challenges.find(c => c.id === id);
        if (challenge) {
          analytics.trackChallengeAction('edited', challenge.title);
        }
      }
      
      return {
        ...prevState,
        challenges: updatedChallenges
      };
    });
  };

  const removeChallenge = (id: string) => {
    setState((prevState: DiscoveryState) => {
      const challengeToRemove = prevState.challenges.find(c => c.id === id);
      if (challengeToRemove) {
        analytics.trackChallengeAction('deleted', challengeToRemove.title);
      }
      
      return {
        ...prevState,
        challenges: prevState.challenges.filter((challenge: Challenge) => challenge.id !== id)
      };
    });
  };

  const reorderChallenges = (oldIndex: number, newIndex: number) => {
    setState((prevState: DiscoveryState) => {
      const newChallenges = [...prevState.challenges];
      const [reorderedItem] = newChallenges.splice(oldIndex, 1);
      newChallenges.splice(newIndex, 0, reorderedItem);
      
      return {
        ...prevState,
        challenges: newChallenges
      };
    });
  };

  const updateChallengePosition = (id: string, position: { x: number; y: number }) => {
    setState((prevState: DiscoveryState) => ({
      ...prevState,
      challenges: prevState.challenges.map((challenge: Challenge) =>
        challenge.id === id ? { ...challenge, position } : challenge
      )
    }));
  };

  const updateChallengeRating = (id: string, key: 'value' | 'effort', value: 'high' | 'medium' | 'low') => {
    setState((prevState: DiscoveryState) => ({
      ...prevState,
      challenges: prevState.challenges.map((challenge: Challenge) =>
        challenge.id === id ? { ...challenge, [key]: value } : challenge
      )
    }));
  };

  const setSuccessVision = (vision: string) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, successVision: vision }));
  };

  const setSelectedKPIs = (kpis: string[]) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, selectedKPIs: kpis }));
  };

  // Add brief to specific challenge
  const addBriefToChallenge = (challengeId: string, brief: Brief) => {
    setState((prevState: DiscoveryState) => {
      const challenge = prevState.challenges.find(c => c.id === challengeId);
      if (challenge) {
        analytics.trackBriefGenerated(challenge.title, challengeId);
      }
      
      return {
        ...prevState,
        challenges: prevState.challenges.map((challenge: Challenge) =>
          challenge.id === challengeId ? { ...challenge, brief } : challenge
        )
      };
    });
  };

  // Get brief for specific challenge
  const getBriefForChallenge = (challengeId: string): Brief | null => {
    const challenge = state.challenges.find(c => c.id === challengeId);
    return challenge?.brief || null;
  };

  const setAvailableKPIs = (kpis: string[]) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, availableKPIs: kpis }));
  };

  const setIsGeneratingBrief = (isGenerating: boolean) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, isGeneratingBrief: isGenerating }));
  };

  const setBriefError = (error: string | null) => {
    setState((prevState: DiscoveryState) => ({ ...prevState, briefError: error }));
  };


  const setCurrentStep = (step: number) => {
    setState((prevState: DiscoveryState) => {
      // Track step navigation
      if (step !== prevState.currentStep) {
        analytics.trackStepNavigation(prevState.currentStep, step);
      }
      
      // Mark the current step as visited when navigating away from it
      const newVisitedSteps = prevState.visitedSteps.includes(prevState.currentStep)
        ? prevState.visitedSteps
        : [...prevState.visitedSteps, prevState.currentStep];
      
      // Add the new step to visited steps if it's not already there
      const finalVisitedSteps = newVisitedSteps.includes(step)
        ? newVisitedSteps
        : [...newVisitedSteps, step];
      
      return {
        ...prevState,
        currentStep: step,
        visitedSteps: finalVisitedSteps
      };
    });
  };

  const addVisitedStep = (step: number) => {
    setState((prevState: DiscoveryState) => ({
      ...prevState,
      visitedSteps: prevState.visitedSteps.includes(step) 
        ? prevState.visitedSteps 
        : [...prevState.visitedSteps, step]
    }));
  };

  // Step completion checking functions
  const isStepCompleted = (step: number): boolean => {
    switch (step) {
      case 1: // Step 1: Required fields filled (name, organization, role)
        return !!(state.userData.name && state.userData.organization && state.userData.role);
      case 2: // Step 2: At least one challenge/opportunity identified
        return state.challenges.length > 0;
      case 3: // Step 3: At least one brief generated
        return state.challenges.length > 0 && state.challenges.some(c => !!c.brief);
      default:
        return false;
    }
  };

  const isStepVisited = (step: number): boolean => {
    return state.visitedSteps.includes(step);
  };

  const canNavigateToStep = (step: number): boolean => {
    // Can navigate to current step, any completed step, or any visited step
    return step === state.currentStep || isStepCompleted(step) || isStepVisited(step);
  };

  // Get unified chat history
  const getUnifiedChatHistory = () => {
    return state.conversationHistory;
  };

  // Initialize chat with an optional initial message
  const initializeChat = (initialMessage?: string) => {
    setState((prevState: DiscoveryState) => {
      // Only initialize if conversation is empty
      if (prevState.conversationHistory.length > 0) {
        return prevState; // Don't reinitialize if already exists
      }
      
      if (initialMessage) {
        return {
          ...prevState,
          conversationHistory: [
            {
              role: 'ai' as const,
              content: initialMessage
            }
          ]
        };
      }
      
      return prevState;
    });
  };

  const addToConversation = (role: 'user' | 'ai', content: string) => {
    setState((prevState: DiscoveryState) => {
      // Track user messages for analytics
      if (role === 'user') {
        analytics.trackMessage(content, prevState.currentStep);
      }
      
      return {
        ...prevState,
        conversationHistory: [...prevState.conversationHistory, { role, content }]
      };
    });
  };

  const resetDiscovery = () => {
    console.log('🔧 Discovery context: Starting reset...');
    
    // Set reset flag to prevent automatic saving
    isResettingRef.current = true;
    
    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Clear localStorage first
    localStorage.removeItem('discoveryState');
    localStorage.removeItem('devTools_modifiedPrompts');
    localStorage.removeItem('industry_preference');
    
    // Clear any other discovery-related localStorage keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('discovery') || key.startsWith('devTools_') || key.startsWith('industry_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🔧 Discovery context: localStorage cleared');
    
    // Create a fresh copy of initial state
    const freshInitialState = {
      selectedIndustryKey: null,
      userData: {
        name: '',
        email: '',
        role: '',
        organization: '',
        organizationDescription: '',
        industry: '',
        aiStance: '',
        innovationCulture: '',
        aiSentiment: '',
        organizationResearch: undefined,
        discoveryPreferences: {
          timeCommitment: '',
          detailLevel: '',
          industryTemplates: true
        },
      },
      contextSummary: '',
      contextBullets: [],
      interactionMode: 'guided' as const,
      selectedFramework: 'jtbd',
      challenges: [],
      successVision: '',
      selectedKPIs: [],
      availableKPIs: [],
      isGeneratingBrief: false,
      briefError: null,
      currentStep: 1,
      visitedSteps: [1],
      conversationHistory: [],
    };
    
    // Reset state to fresh initial state
    setState(freshInitialState);
    
    console.log('🔧 Discovery context: State reset to:', freshInitialState);
    
    // Reset the flag after a delay
    setTimeout(() => {
      isResettingRef.current = false;
      console.log('🔧 Discovery context: Reset complete');
    }, 100);
  };

  // Computed values
  const contextValue: DiscoveryContextType = {
    ...state,
    setSelectedIndustryKey,
    setUserData,
    setContextSummary,
    setContextBullets,
    setInteractionMode,
    setSelectedFramework,
    addChallenge,
    updateChallenge,
    removeChallenge,
    reorderChallenges,
    updateChallengePosition,
    updateChallengeRating,
      setSuccessVision,
    setSelectedKPIs,
    addBriefToChallenge,
    getBriefForChallenge,
    setAvailableKPIs,
    setIsGeneratingBrief,
    setBriefError,
    setCurrentStep,
    addVisitedStep,
    isStepCompleted,
    isStepVisited,
    canNavigateToStep,
    addToConversation,
    getUnifiedChatHistory,
    initializeChat,
    resetDiscovery
  };

  return (
    <DiscoveryContext.Provider value={contextValue}>
      {children}
    </DiscoveryContext.Provider>
  );
};

export const useDiscovery = () => {
  const context = useContext(DiscoveryContext);
  if (context === undefined) {
    throw new Error('useDiscovery must be used within a DiscoveryProvider');
  }
  return context;
};