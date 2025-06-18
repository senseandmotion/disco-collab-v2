import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppContext } from './AppContext';
import { Opportunity } from '../types';

// Types for collaborative discovery
export interface DiscoveryBrief {
  id: string;
  opportunityId: string;
  problemStatement: string;
  opportunity: string;
  successIndicators: string[];
  nextSteps: string[];
  createdAt: Date;
  createdBy: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  opportunityId?: string; // Link to specific opportunity if relevant
}

export interface SessionStats {
  totalOpportunities: number;
  completedBriefs: number;
  participantCount: number;
  averagePriority: number;
}

interface CollaborativeDiscoveryContextType {
  // Chat functionality
  chatMessages: ChatMessage[];
  addChatMessage: (role: 'user' | 'ai', content: string, opportunityId?: string) => void;
  getChatHistoryForOpportunity: (opportunityId: string) => ChatMessage[];
  
  // Brief management
  briefs: DiscoveryBrief[];
  addBrief: (opportunityId: string, brief: Omit<DiscoveryBrief, 'id' | 'createdAt' | 'createdBy'>) => void;
  getBriefForOpportunity: (opportunityId: string) => DiscoveryBrief | null;
  updateBrief: (briefId: string, updates: Partial<DiscoveryBrief>) => void;
  
  // AI context
  aiStance: 'progressive' | 'moderate' | 'conservative';
  setAiStance: (stance: 'progressive' | 'moderate' | 'conservative') => void;
  organizationContext: string;
  setOrganizationContext: (context: string) => void;
  
  // Session workflow
  isSessionActive: boolean;
  sessionStats: SessionStats;
  refreshSessionStats: () => void;
  
  // Export functionality
  exportSessionData: () => Promise<string>;
  downloadSessionBrief: (format: 'txt' | 'pdf') => Promise<void>;
}

const CollaborativeDiscoveryContext = createContext<CollaborativeDiscoveryContextType | undefined>(undefined);

export const CollaborativeDiscoveryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentSession, currentUser, opportunities } = useAppContext();
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [briefs, setBriefs] = useState<DiscoveryBrief[]>([]);
  const [aiStance, setAiStance] = useState<'progressive' | 'moderate' | 'conservative'>('moderate');
  const [organizationContext, setOrganizationContext] = useState('');

  // Load data from localStorage
  useEffect(() => {
    if (currentSession) {
      const savedMessages = localStorage.getItem(`discovery-chat-${currentSession.id}`);
      const savedBriefs = localStorage.getItem(`discovery-briefs-${currentSession.id}`);
      const savedContext = localStorage.getItem(`discovery-context-${currentSession.id}`);
      
      if (savedMessages) setChatMessages(JSON.parse(savedMessages));
      if (savedBriefs) setBriefs(JSON.parse(savedBriefs));
      if (savedContext) {
        const context = JSON.parse(savedContext);
        setAiStance(context.aiStance || 'moderate');
        setOrganizationContext(context.organizationContext || '');
      }
    }
  }, [currentSession]);

  // Save data to localStorage
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(`discovery-chat-${currentSession.id}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, currentSession]);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(`discovery-briefs-${currentSession.id}`, JSON.stringify(briefs));
    }
  }, [briefs, currentSession]);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(`discovery-context-${currentSession.id}`, JSON.stringify({
        aiStance,
        organizationContext
      }));
    }
  }, [aiStance, organizationContext, currentSession]);

  const addChatMessage = (role: 'user' | 'ai', content: string, opportunityId?: string) => {
    if (!currentSession || !currentUser) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sessionId: currentSession.id,
      userId: role === 'user' ? currentUser.id : 'ai',
      userName: role === 'user' ? currentUser.name : 'AI Assistant',
      role,
      content,
      timestamp: new Date(),
      opportunityId
    };
    
    setChatMessages(prev => [...prev, newMessage]);
  };

  const getChatHistoryForOpportunity = (opportunityId: string): ChatMessage[] => {
    return chatMessages.filter(msg => msg.opportunityId === opportunityId);
  };

  const addBrief = (opportunityId: string, briefData: Omit<DiscoveryBrief, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!currentUser) return;
    
    const newBrief: DiscoveryBrief = {
      id: `brief-${Date.now()}`,
      ...briefData,
      opportunityId,
      createdAt: new Date(),
      createdBy: currentUser.id
    };
    
    setBriefs(prev => [...prev, newBrief]);
  };

  const getBriefForOpportunity = (opportunityId: string): DiscoveryBrief | null => {
    return briefs.find(brief => brief.opportunityId === opportunityId) || null;
  };

  const updateBrief = (briefId: string, updates: Partial<DiscoveryBrief>) => {
    setBriefs(prev => prev.map(brief => 
      brief.id === briefId ? { ...brief, ...updates } : brief
    ));
  };

  const sessionStats: SessionStats = {
    totalOpportunities: opportunities.length,
    completedBriefs: briefs.length,
    participantCount: currentSession?.participants.length || 0,
    averagePriority: opportunities.reduce((sum, opp) => sum + (opp.priority || 0), 0) / (opportunities.length || 1)
  };

  const refreshSessionStats = () => {
    // Force re-render by updating state
    setChatMessages(prev => [...prev]);
  };

  const exportSessionData = async (): Promise<string> => {
    if (!currentSession) return '';
    
    const exportData = {
      session: currentSession,
      opportunities,
      briefs,
      chatHistory: chatMessages,
      organizationContext,
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const downloadSessionBrief = async (format: 'txt' | 'pdf' = 'txt') => {
    if (!currentSession) return;
    
    let content = `DISCOVERY SESSION BRIEF
============================
Session: ${currentSession.name}
Date: ${new Date().toLocaleDateString()}
Participants: ${currentSession.participants.length}

ORGANIZATION CONTEXT:
${organizationContext || 'Not specified'}

OPPORTUNITIES IDENTIFIED (${opportunities.length}):
${opportunities.map((opp, i) => `
${i + 1}. ${opp.title}
   Description: ${opp.description}
   Status: ${opp.status}
   Category: ${opp.category || 'General'}
`).join('\n')}

DETAILED BRIEFS (${briefs.length}):
${briefs.map((brief, i) => {
  const opp = opportunities.find(o => o.id === brief.opportunityId);
  return `
${i + 1}. ${opp?.title || 'Unknown'}
   
   PROBLEM STATEMENT:
   ${brief.problemStatement}
   
   OPPORTUNITY:
   ${brief.opportunity}
   
   SUCCESS INDICATORS:
   ${brief.successIndicators.map(si => `   • ${si}`).join('\n')}
   
   NEXT STEPS:
   ${brief.nextSteps.map(ns => `   • ${ns}`).join('\n')}
`;
}).join('\n')}

============================
Generated on ${new Date().toLocaleString()}
`;

    if (format === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `discovery-session-${currentSession.code}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // PDF generation would require additional library
      console.log('PDF export not yet implemented');
    }
  };

  const value = {
    chatMessages,
    addChatMessage,
    getChatHistoryForOpportunity,
    briefs,
    addBrief,
    getBriefForOpportunity,
    updateBrief,
    aiStance,
    setAiStance,
    organizationContext,
    setOrganizationContext,
    isSessionActive: !!currentSession,
    sessionStats,
    refreshSessionStats,
    exportSessionData,
    downloadSessionBrief
  };

  return (
    <CollaborativeDiscoveryContext.Provider value={value}>
      {children}
    </CollaborativeDiscoveryContext.Provider>
  );
};

export const useCollaborativeDiscovery = () => {
  const context = useContext(CollaborativeDiscoveryContext);
  if (!context) {
    throw new Error('useCollaborativeDiscovery must be used within a CollaborativeDiscoveryProvider');
  }
  return context;
};