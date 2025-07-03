import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session, User, Opportunity } from '../types';

interface AppContextType {
  currentSession: Session | null;
  currentUser: User | null;
  opportunities: Opportunity[];
  setCurrentSession: (session: Session | null) => void;
  setCurrentUser: (user: User | null) => void;
  addOpportunity: (opportunity: Opportunity) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    const savedSession = localStorage.getItem('discovery-session');
    const savedUser = localStorage.getItem('discovery-user');
    const savedOpportunities = localStorage.getItem('discovery-opportunities');

    if (savedSession) {
      setCurrentSession(JSON.parse(savedSession));
    }
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedOpportunities) {
      setOpportunities(JSON.parse(savedOpportunities));
    }
  }, []);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('discovery-session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('discovery-session');
    }
  }, [currentSession]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('discovery-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('discovery-user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('discovery-opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  const addOpportunity = (opportunity: Opportunity) => {
    setOpportunities(prev => [...prev, opportunity]);
  };

  const updateOpportunity = (id: string, updates: Partial<Opportunity>) => {
    setOpportunities(prev =>
      prev.map(opp => (opp.id === id ? { ...opp, ...updates } : opp))
    );
  };

  const deleteOpportunity = (id: string) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== id));
  };

  const value = {
    currentSession,
    currentUser,
    opportunities,
    setCurrentSession,
    setCurrentUser,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};