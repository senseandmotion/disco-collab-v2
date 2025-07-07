# Backend API Proxy for Claude AI Integration

## Issue
The Claude API cannot be called directly from the browser due to CORS restrictions. Currently using a public CORS proxy (corsproxy.io) as a temporary workaround, which is not suitable for production.

## Current Implementation
- Frontend attempts to call Claude API directly from `src/services/ClaudeAPIService.ts`
- Using `https://corsproxy.io/?https://api.anthropic.com/v1/messages` as a temporary workaround
- API key is exposed in browser environment (security risk)

## Required Solution
Implement a backend API proxy that:
1. Receives requests from the frontend
2. Makes Claude API calls server-side
3. Returns responses to the frontend
4. Keeps API keys secure on the server

## Acceptance Criteria
- [ ] Create backend endpoint (e.g., `/api/ai/chat`) that proxies Claude API calls
- [ ] Move `VITE_CLAUDE_API_KEY` to server-side environment variables
- [ ] Update `ClaudeAPIService.ts` to call the backend endpoint instead of Claude directly
- [ ] Remove CORS proxy workaround
- [ ] Implement proper error handling and rate limiting
- [ ] Add authentication to ensure only authorized users can make AI requests

## Implementation Notes
### Backend endpoint should handle:
- `POST /api/ai/chat` - For chat conversations
- `POST /api/ai/analyze` - For opportunity analysis
- Proper request validation
- Error responses that don't expose sensitive information

### Security considerations:
- Never expose API keys to frontend
- Implement rate limiting per user/session
- Log API usage for monitoring
- Consider request size limits

## Priority
High - Current implementation is insecure and unsuitable for production use.

## Related Files
- `src/services/ClaudeAPIService.ts` - Needs to be updated to use backend endpoint
- `src/components/ai/ChatInterface.tsx` - Main consumer of the AI service