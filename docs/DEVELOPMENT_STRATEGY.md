# Development Strategy

## Approach: Build from Scratch with MUI
**Strategy**: Build native MUI components designed for collaborative workflows

### Phase-by-Phase Development

#### Phase 1: Core Foundation
- [ ] **Session creation interface** - Team Lead creates session
- [ ] **Participant management** - view and assign roles to team members
- [ ] **Basic session state management** with LocalStorage
- [ ] **Simple navigation** between components

#### Phase 2: Opportunity Management
- [ ] **Opportunity submission form** with basic AI integration
- [ ] **Opportunity listing** with real-time updates
- [ ] **Comment system** for team collaboration
- [ ] **Phase transition controls** for Team Lead

#### Phase 3: AI Integration
- [ ] **AI chat component** built with MUI
- [ ] **Clustering/synthesis** functionality
- [ ] **Decider approval workflow** for AI recommendations
- [ ] **Contextual AI prompts** throughout workflow

#### Phase 4: Prioritization & Export
- [ ] **Impact/Effort slider interface**
- [ ] **Priority grid visualization** 
- [ ] **PDF export** functionality
- [ ] **Session completion** workflow

## Key Principles
1. **Build incrementally** - one working feature at a time
2. **Test after each change** - keep builds working
3. **Focus on functionality** for prototype
4. **Use MUI components** consistently throughout
5. **Collaborative-first design** - built for team workflows

## Reference Materials
The `/reference-v1/` folder contains components from a previous single-user discovery tool that serve as reference for patterns and concepts:

- **AIService.ts** - AI prompt templates and mock response patterns
- **AIChat.tsx** - Chat interface UX patterns  
- **EditableSummary.tsx** - Inline editing component patterns
- **DiscoveryContext.tsx** - State management approach
- **Button.tsx** - Custom component patterns

These files are **reference only** and not part of the active build. When implementing AI integration and collaborative features, we'll reference these patterns while building new MUI-based components from scratch.