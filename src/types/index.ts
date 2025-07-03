export type UserRole = 'team-lead' | 'decider' | 'contributor';

export type SessionPhase = 'discovery' | 'review' | 'prioritization' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
  companyRole?: string;
  sessions: string[]; // Session IDs
  digestSettings: {
    enabled: boolean;
    time: string; // "16:00"
    timezone: string;
  };
  createdAt: string; // ISO 8601
  lastLoginAt: string;
}

export interface Session {
  id: string;
  slug: string; // Globally unique URL-friendly identifier
  name: string;
  teamLeadId: string;
  phase: SessionPhase;
  participants: string[]; // User IDs
  inviteToken: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  isActive: boolean;
  isArchived: boolean;
}

export interface Opportunity {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  successVision: string;
  submittedById: string;
  status: 'draft' | 'submitted' | 'approved' | 'merged';
  categoryId?: string;
  assignedDeciderId?: string;
  scores: { [userId: string]: { impact: number; effort: number; submittedAt: string } };
  aiInsights?: AIInsights;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface AIInsights {
  estimatedComplexity: 'low' | 'medium' | 'high';
  implementationConsiderations: string[];
  successMetrics: string[];
  relatedOpportunityIds: string[];
}

export interface Comment {
  id: string;
  opportunityId: string;
  userId: string;
  content: string;
  reactions: {
    thumbsUp: string[]; // user IDs
    thumbsDown: string[]; // user IDs
  };
  parentCommentId?: string; // for threading
  createdAt: string; // ISO 8601
}

export interface OpportunityCategory {
  id: string;
  name: string;
  description: string;
  opportunityIds: string[];
  aiConfidence: 'high' | 'medium' | 'low';
  aiReasoning: string;
  assignedDeciderId?: string;
  approvalStatus: 'pending' | 'approved' | 'modified' | 'rejected';
  deciderNotes?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601
  opportunityId?: string; // Link to specific opportunity if relevant
  context?: 'opportunity-creation' | 'general-guidance' | 'review-analysis';
}

export interface MagicLink {
  token: string;
  email: string;
  sessionSlug?: string;
  expiresAt: string; // ISO 8601
  used: boolean;
}

export interface Export {
  id: string;
  sessionId: string;
  type: 'txt' | 'pdf' | 'json';
  createdById: string;
  createdAt: string; // ISO 8601
  downloadUrl?: string;
}