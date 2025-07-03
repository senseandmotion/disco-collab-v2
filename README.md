# Discovery Collaborative - AI-Powered Business Process Discovery

A React + TypeScript + Vite application for collaborative business process discovery sessions with AI assistance.

## Project Overview

This application facilitates collaborative discovery sessions where teams can identify AI automation opportunities in their business processes. It features role-based access control, AI-powered guidance, and structured workflows through discovery, review, and prioritization phases.

## Current Status: Prototype/Development Mode

⚠️ **IMPORTANT: Authentication Workaround Active**

The application currently uses a simplified authentication system for development purposes:

### What's Working:
- Session creation automatically logs you in as the team lead
- No email verification required during development
- Direct access to session dashboard after creation

### What's Temporarily Disabled:
- Magic link email authentication flow
- Full multi-user join process via email
- Real email sending (Resend integration ready but bypassed)

### Production TODO:
1. **Fix Authentication Flow**: 
   - Resolve the stale user context issue causing "User not a participant" errors
   - Implement proper user state synchronization between storage and React context
   - Fix infinite re-render loops in SessionDashboard and CreateOpportunityDialog

2. **Email Integration**:
   - Move Resend API calls to backend server (currently blocked by CORS in frontend)
   - Implement proper server-side magic link generation and verification
   - Add proper session invitation flow with email notifications

3. **Multi-user Testing**:
   - Test complete join session flow with multiple users
   - Verify role-based permissions and phase transitions
   - Test collaboration features with real user sessions

## Architecture

- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **State Management**: React Context API
- **Data Persistence**: LocalStorage (prototype) - ready for backend integration
- **AI Integration**: Claude API (Anthropic)
- **Email Service**: Resend (configured but needs backend implementation)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
   ```
   VITE_CLAUDE_API_KEY=your_claude_api_key_here
   VITE_RESEND_API_KEY=your_resend_api_key_here
   ```
4. Start development server: `npm run dev`
5. Create a session - you'll be automatically logged in as team lead

## Key Features

- **Session Management**: Create and manage discovery sessions with unique URLs
- **AI Assistant**: Claude-powered guidance for opportunity identification and analysis
- **Role-Based Access**: Team Lead, Decider, and Contributor roles with different permissions
- **Three-Phase Workflow**: Discovery → Review → Prioritization
- **Collaborative Tools**: Comments, reactions, and real-time collaboration simulation
- **Export Capabilities**: PDF generation for session reports (react-pdf integration ready)

## Development Notes

- All user data is stored in localStorage for prototype purposes
- Session URLs use human-readable slugs with collision detection
- AI responses include fallback to mock data when API is unavailable
- Data models are designed for easy backend integration

## Tech Stack

- React 18 + TypeScript
- Material-UI (MUI) for components
- Vite for build tooling
- React Router for navigation
- UUID for unique identifiers
- react-pdf for report generation
- Resend for email services