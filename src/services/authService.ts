import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../utils/storage';
import emailService from './emailService';
import type { User, MagicLink } from '../types';

class AuthService {
  private readonly MAGIC_LINK_EXPIRY = parseInt(import.meta.env.VITE_MAGIC_LINK_EXPIRY || '3600000'); // 1 hour

  async sendMagicLink(email: string, sessionSlug?: string): Promise<boolean> {
    try {
      // Generate magic link token
      const token = uuidv4();
      
      // Calculate expiry time
      const expiresAt = new Date(Date.now() + this.MAGIC_LINK_EXPIRY).toISOString();
      
      // Create magic link record
      const magicLink: MagicLink = {
        token,
        email,
        sessionSlug,
        expiresAt,
        used: false
      };
      
      // Save magic link to storage
      StorageService.saveMagicLink(magicLink);
      
      // Send email
      const emailSent = await emailService.sendMagicLink(email, token, sessionSlug);
      
      if (!emailSent) {
        // For development without email configured
        console.log('Magic link generated:', {
          url: `${import.meta.env.VITE_APP_URL}/auth/verify?token=${token}${sessionSlug ? `&session=${sessionSlug}` : ''}`,
          expiresAt
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send magic link:', error);
      return false;
    }
  }

  async verifyMagicLink(token: string): Promise<{ success: boolean; user?: User; sessionSlug?: string }> {
    try {
      // Clean up expired links first
      StorageService.cleanupExpiredMagicLinks();
      
      // Get magic link
      const magicLink = StorageService.getMagicLink(token);
      
      if (!magicLink) {
        return { success: false };
      }
      
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(magicLink.expiresAt);
      
      if (expiresAt < now) {
        return { success: false };
      }
      
      // Mark as used
      StorageService.markMagicLinkUsed(token);
      
      // Get or create user
      let user = StorageService.getUserByEmail(magicLink.email);
      
      if (!user) {
        // This shouldn't happen in the join flow, but handle it gracefully
        user = {
          id: uuidv4(),
          email: magicLink.email,
          name: magicLink.email.split('@')[0], // Default name from email
          sessions: [],
          digestSettings: {
            enabled: true,
            time: import.meta.env.VITE_DIGEST_DEFAULT_TIME || '16:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
      }

      // Update last login
      user.lastLoginAt = new Date().toISOString();
      
      // If we have a session slug, ensure user is part of that session
      if (magicLink.sessionSlug) {
        const session = StorageService.getSession(magicLink.sessionSlug);
        if (session) {
          // Add session to user's sessions if not already there
          if (!user.sessions.includes(session.id)) {
            user.sessions.push(session.id);
          }
          
          // Add user to session participants if not already there
          if (!session.participants.includes(user.id)) {
            session.participants.push(user.id);
            session.updatedAt = new Date().toISOString();
            StorageService.saveSession(session);
          }
        }
      }
      
      // Save user
      StorageService.saveUser(user);
      
      // Set as current user
      StorageService.setCurrentUser(user);
      
      return { 
        success: true, 
        user,
        sessionSlug: magicLink.sessionSlug 
      };
    } catch (error) {
      console.error('Failed to verify magic link:', error);
      return { success: false };
    }
  }

  async logout(): Promise<void> {
    StorageService.clearCurrentUser();
  }

  getCurrentUser(): User | null {
    return StorageService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

export default new AuthService();