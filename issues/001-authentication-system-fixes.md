# Authentication System Fixes

**Issue ID:** 001  
**Created:** 2025-01-03  
**Status:** Open  
**Priority:** High  

## Description

The authentication system currently has a simplified workaround for development. The full magic link email authentication flow needs to be properly implemented for production use.

## Current Issues

1. **Stale User Context**
   - When creating a session, the user is updated in storage but the AuthContext still has old user data
   - This causes "User not a participant in this session" errors
   - The custom event system (`userUpdated`) was added as a workaround

2. **Email Integration Blocked by CORS**
   - Resend API cannot be called from frontend due to CORS restrictions
   - Email sending is currently simulated with console logs
   - Needs backend implementation for security

3. **Infinite Re-render Loops**
   - SessionDashboard and CreateOpportunityDialog had infinite re-render issues
   - Temporarily fixed by adjusting dependencies, but root cause needs investigation

## Acceptance Criteria

- [ ] User can create a session and be automatically authenticated without page reload
- [ ] User can join a session via email magic link that actually sends an email
- [ ] Magic link verification works without showing "link expired" errors
- [ ] No infinite re-render loops in any components
- [ ] Proper state synchronization between storage and React contexts
- [ ] Backend API endpoint for secure email sending
- [ ] Multi-user collaboration works with proper session access control

## Technical Requirements

### Backend Requirements
- Create `/api/send-magic-link` endpoint
- Move Resend API key to server environment
- Implement secure token generation and verification
- Add rate limiting for email sending

### Frontend Requirements
- Remove authentication workarounds
- Implement proper context state management
- Fix component re-rendering issues
- Add proper error handling for API calls

## Related Files
- `/src/context/AuthContext.tsx`
- `/src/services/authService.ts`
- `/src/services/emailService.ts`
- `/src/pages/CreateSession.tsx`
- `/src/pages/JoinSession.tsx`
- `/src/pages/MagicLinkVerify.tsx`
- `/src/pages/SessionDashboard.tsx`
- `/src/context/SessionContext.tsx`

## Notes
- Current workaround documented in README.md
- Resend integration is configured but needs backend
- Data models are ready for backend integration