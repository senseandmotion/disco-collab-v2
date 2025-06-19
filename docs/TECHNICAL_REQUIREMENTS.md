# Technical Requirements

## Core Stack
- **React 18** + TypeScript + Vite
- **Material-UI (MUI)** for all components
- **React Context** for state management
- **LocalStorage** for data persistence
- **No backend** - full prototype functionality

## Data Models

### Session
```typescript
interface Session {
  id: string;
  name: string;
  teamLead: string;
  phase: 'discovery' | 'review' | 'prioritization' | 'complete';
  participants: Participant[];
  opportunities: Opportunity[];
  settings: SessionSettings;
  createdAt: Date;
}
```

### Opportunity
```typescript
interface Opportunity {
  id: string;
  title: string;
  description: string;
  submittedBy: string;
  successVision: string;
  comments: Comment[];
  impactScore?: number;
  effortScore?: number;
  status: 'draft' | 'submitted' | 'approved' | 'merged';
  clusterId?: string;
}
```

### Participant
```typescript
interface Participant {
  id: string;
  name: string;
  role: 'team-lead' | 'decider' | 'contributor';
  joinedAt: Date;
}
```

## File Structure
```
src/
├── components/
│   ├── session/          # Session creation, management
│   ├── opportunities/    # Opportunity CRUD, listing
│   ├── collaboration/    # Comments, discussions
│   ├── prioritization/   # Impact/effort, voting
│   ├── ai/              # AI chat, synthesis
│   └── export/          # Results export
├── context/             # Session and app state
├── services/            # AI service, utilities
├── types/               # TypeScript interfaces
└── docs/                # This documentation
```