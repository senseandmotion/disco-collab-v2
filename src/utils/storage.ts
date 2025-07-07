import type { Session, User, Opportunity, Comment, ChatMessage, MagicLink, OpportunityCategory } from '../types';

const STORAGE_PREFIX = 'discovery-v2-';

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

export class StorageService {
  // Session storage
  static saveSession(session: Session): void {
    storage.set(`session-${session.slug}`, session);
    this.updateUserSessions(session.teamLeadId, session.id);
  }

  static getSession(slug: string): Session | null {
    return storage.get<Session>(`session-${slug}`);
  }

  static getAllSessions(): Session[] {
    const sessions: Session[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_PREFIX}session-`)) {
        try {
          const session = JSON.parse(localStorage.getItem(key) || '{}');
          sessions.push(session);
        } catch (error) {
          console.warn('Failed to parse session:', key);
        }
      }
    }
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // User storage
  static saveUser(user: User): void {
    storage.set(`user-${user.email}`, user);
  }

  static getUserByEmail(email: string): User | null {
    return storage.get<User>(`user-${email}`);
  }

  static getUserById(id: string): User | null {
    // Search through all stored users
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${STORAGE_PREFIX}user-`)) {
        try {
          const user = JSON.parse(localStorage.getItem(key) || '{}');
          if (user.id === id) return user;
        } catch (error) {
          console.warn('Failed to parse user:', key);
        }
      }
    }
    return null;
  }

  private static updateUserSessions(userId: string, sessionId: string): void {
    const user = this.getUserById(userId);
    if (user) {
      if (!user.sessions.includes(sessionId)) {
        user.sessions.push(sessionId);
        this.saveUser(user);
      }
    }
  }

  // Opportunities storage
  static saveOpportunities(sessionId: string, opportunities: Opportunity[]): void {
    storage.set(`opportunities-${sessionId}`, opportunities);
  }

  static getOpportunities(sessionId: string): Opportunity[] {
    return storage.get<Opportunity[]>(`opportunities-${sessionId}`) || [];
  }

  // Comments storage
  static saveComments(opportunityId: string, comments: Comment[]): void {
    storage.set(`comments-${opportunityId}`, comments);
  }

  static getComments(opportunityId: string): Comment[] {
    return storage.get<Comment[]>(`comments-${opportunityId}`) || [];
  }

  // Chat messages storage
  static saveChatMessages(sessionId: string, userId: string, messages: ChatMessage[]): void {
    storage.set(`chat-${sessionId}-${userId}`, messages);
  }

  static getChatMessages(sessionId: string, userId: string): ChatMessage[] {
    return storage.get<ChatMessage[]>(`chat-${sessionId}-${userId}`) || [];
  }

  // Magic links storage (for prototype)
  static saveMagicLink(magicLink: MagicLink): void {
    const links = this.getAllMagicLinks();
    links.push(magicLink);
    storage.set('magic-links', links);
  }

  static getMagicLink(token: string): MagicLink | null {
    const links = this.getAllMagicLinks();
    return links.find(link => link.token === token && !link.used) || null;
  }

  static markMagicLinkUsed(token: string): void {
    const links = this.getAllMagicLinks();
    const link = links.find(l => l.token === token);
    if (link) {
      link.used = true;
      storage.set('magic-links', links);
    }
  }

  private static getAllMagicLinks(): MagicLink[] {
    return storage.get<MagicLink[]>('magic-links') || [];
  }

  // Current user session
  static setCurrentUser(user: User): void {
    storage.set('current-user', user);
  }

  static getCurrentUser(): User | null {
    return storage.get<User>('current-user');
  }

  static clearCurrentUser(): void {
    storage.remove('current-user');
  }

  // Cleanup expired magic links
  static cleanupExpiredMagicLinks(): void {
    const links = this.getAllMagicLinks();
    const now = new Date();
    const validLinks = links.filter(link => {
      const linkExpiry = new Date(link.expiresAt);
      return linkExpiry > now && !link.used;
    });
    storage.set('magic-links', validLinks);
  }

  // Category storage
  static saveCategories(sessionId: string, categories: OpportunityCategory[]): void {
    storage.set(`categories-${sessionId}`, categories);
  }

  static getCategories(sessionId: string): OpportunityCategory[] {
    return storage.get<OpportunityCategory[]>(`categories-${sessionId}`) || [];
  }

  static updateCategory(sessionId: string, categoryId: string, updates: Partial<OpportunityCategory>): void {
    const categories = this.getCategories(sessionId);
    const index = categories.findIndex(cat => cat.id === categoryId);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      this.saveCategories(sessionId, categories);
    }
  }

  static deleteCategory(sessionId: string, categoryId: string): void {
    const categories = this.getCategories(sessionId);
    const filtered = categories.filter(cat => cat.id !== categoryId);
    this.saveCategories(sessionId, filtered);
  }
}