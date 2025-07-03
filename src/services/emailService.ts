import { Resend } from 'resend';
import type { MagicLink } from '../types';

class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private appUrl: string;

  constructor() {
    const apiKey = import.meta.env.VITE_RESEND_API_KEY;
    this.fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@localhost';
    this.appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  isConfigured(): boolean {
    return this.resend !== null;
  }

  async sendMagicLink(email: string, token: string, sessionSlug?: string): Promise<boolean> {
    const magicUrl = sessionSlug 
      ? `${this.appUrl}/auth/verify?token=${token}&session=${sessionSlug}`
      : `${this.appUrl}/auth/verify?token=${token}`;

    // For prototype: Display magic link in console and copy to clipboard
    console.log('='.repeat(60));
    console.log('MAGIC LINK FOR TESTING');
    console.log('='.repeat(60));
    console.log('Email:', email);
    console.log('Magic Link URL:', magicUrl);
    console.log('='.repeat(60));
    console.log('Copy the URL above or click the link below:');
    console.log(magicUrl);
    console.log('='.repeat(60));

    // For development: Also show a notification
    if (typeof window !== 'undefined' && window.navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(magicUrl);
        console.log('✅ Magic link copied to clipboard!');
      } catch (err) {
        console.log('Could not copy to clipboard:', err);
      }
    }

    // Simulate email sent successfully for prototype
    return true;
    
    // Note: In production, this would make a request to your backend server
    // which would then use Resend API securely server-side
  }

  async sendDigestEmail(
    email: string, 
    userName: string,
    sessionName: string,
    digest: {
      newOpportunities: number;
      newComments: number;
      phaseChanges: string[];
      assignments: string[];
    }
  ): Promise<boolean> {
    // For prototype: Log digest info to console
    console.log('='.repeat(60));
    console.log('DIGEST EMAIL FOR TESTING');
    console.log('='.repeat(60));
    console.log('To:', email);
    console.log('Subject:', `Discovery Update: ${sessionName}`);
    console.log('Content:');
    console.log(`- ${digest.newOpportunities} new opportunities`);
    console.log(`- ${digest.newComments} new comments`);
    if (digest.phaseChanges.length > 0) {
      console.log('- Phase changes:', digest.phaseChanges.join(', '));
    }
    if (digest.assignments.length > 0) {
      console.log('- New assignments:', digest.assignments.join(', '));
    }
    console.log('='.repeat(60));

    // Simulate email sent successfully for prototype
    return true;
    
    // Note: In production, this would make a request to your backend server
    // which would then use Resend API securely server-side
  }
}

export default new EmailService();