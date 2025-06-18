import { Session, User } from '../types';

export const generateSessionCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createSession = (name: string, creatorId: string): Session => {
  return {
    id: generateId(),
    code: generateSessionCode(),
    name,
    createdBy: creatorId,
    createdAt: new Date(),
    phase: 'discovery',
    participants: [],
    isActive: true,
  };
};

export const createUser = (name: string, role: User['role']): User => {
  return {
    id: generateId(),
    name,
    role,
    joinedAt: new Date(),
  };
};

export const validateSessionCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};