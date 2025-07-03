import { v4 as uuidv4 } from 'uuid';

export class SlugService {
  
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  static validateSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    return slugRegex.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
  }

  static async checkSlugAvailability(slug: string): Promise<boolean> {
    // Check localStorage for existing sessions
    const existingSessions = this.getAllStoredSessions();
    return !existingSessions.some(session => session.slug === slug);
  }

  static async generateUniqueSlug(baseName: string): Promise<string> {
    let slug = this.generateSlug(baseName);
    let counter = 1;
    
    // Ensure minimum length
    if (slug.length < 3) {
      slug = 'session-' + slug;
    }

    let originalSlug = slug;
    
    // Check for collisions and append counter if needed
    while (!(await this.checkSlugAvailability(slug))) {
      counter++;
      slug = `${originalSlug}-${counter}`;
    }

    return slug;
  }

  static generateInviteToken(): string {
    return uuidv4();
  }

  static generateMagicLinkToken(): string {
    return uuidv4();
  }

  private static getAllStoredSessions() {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('discovery-v2-session-')) {
        try {
          const session = JSON.parse(localStorage.getItem(key) || '{}');
          sessions.push(session);
        } catch (error) {
          console.warn('Failed to parse stored session:', key);
        }
      }
    }
    return sessions;
  }
}

export default SlugService;