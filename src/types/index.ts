export type UserRole = 'team-lead' | 'decider' | 'contributor';

export type SessionPhase = 'discovery' | 'review' | 'prioritization';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  joinedAt: Date;
}

export interface Session {
  id: string;
  code: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  phase: SessionPhase;
  participants: User[];
  isActive: boolean;
}

export interface Opportunity {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  submittedBy: string;
  submittedAt: Date;
  category?: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
  priority?: number;
  votes?: number;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  opportunityId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface Vote {
  opportunityId: string;
  userId: string;
  value: number;
}