import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { StorageService } from '../utils/storage';
import type { Session, User, Opportunity, UserRole } from '../types';

interface SessionContextType {
  session: Session | null;
  participants: User[];
  opportunities: Opportunity[];
  currentUserRole: UserRole;
  isTeamLead: boolean;
  isDecider: boolean;
  loadSession: (slug: string) => Promise<boolean>;
  updateSession: (updates: Partial<Session>) => void;
  addParticipant: (user: User) => void;
  removeParticipant: (userId: string) => void;
  refreshOpportunities: () => void;
  isLoading: boolean;
  error: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async (slug: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionData = StorageService.getSession(slug);
      
      if (!sessionData) {
        setError('Session not found');
        return false;
      }

      if (!user) {
        setError('User not authenticated');
        return false;
      }

      if (!sessionData.participants.includes(user.id)) {
        setError('User not a participant in this session');
        return false;
      }

      setSession(sessionData);

      // Load participants
      const participantData = sessionData.participants
        .map(id => StorageService.getUserById(id))
        .filter(Boolean) as User[];
      setParticipants(participantData);

      // Load opportunities
      const opportunityData = StorageService.getOpportunities(sessionData.id);
      setOpportunities(opportunityData);

      return true;
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load session');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateSession = (updates: Partial<Session>) => {
    if (!session) return;
    
    const updatedSession = { 
      ...session, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    setSession(updatedSession);
    StorageService.saveSession(updatedSession);
  };

  const addParticipant = (newUser: User) => {
    if (!session) return;
    
    if (!session.participants.includes(newUser.id)) {
      const updatedSession = {
        ...session,
        participants: [...session.participants, newUser.id],
        updatedAt: new Date().toISOString()
      };
      
      setSession(updatedSession);
      setParticipants(prev => [...prev, newUser]);
      StorageService.saveSession(updatedSession);
    }
  };

  const removeParticipant = (userId: string) => {
    if (!session || session.teamLeadId === userId) return; // Can't remove team lead
    
    const updatedSession = {
      ...session,
      participants: session.participants.filter(id => id !== userId),
      updatedAt: new Date().toISOString()
    };
    
    setSession(updatedSession);
    setParticipants(prev => prev.filter(p => p.id !== userId));
    StorageService.saveSession(updatedSession);
  };

  const refreshOpportunities = () => {
    if (!session) return;
    
    const opportunityData = StorageService.getOpportunities(session.id);
    setOpportunities(opportunityData);
  };

  const getCurrentUserRole = (): UserRole => {
    if (!session || !user) return 'contributor';
    if (session.teamLeadId === user.id) return 'team-lead';
    
    // TODO: Check if user is assigned as decider for any opportunities
    // For now, return contributor
    return 'contributor';
  };

  const currentUserRole = getCurrentUserRole();
  const isTeamLead = currentUserRole === 'team-lead';
  const isDecider = currentUserRole === 'decider';

  const value = {
    session,
    participants,
    opportunities,
    currentUserRole,
    isTeamLead,
    isDecider,
    loadSession,
    updateSession,
    addParticipant,
    removeParticipant,
    refreshOpportunities,
    isLoading,
    error
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};