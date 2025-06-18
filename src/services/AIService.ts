// Claude API Service integration
import claudeAPIService, { 
  OrganizationResearchResult, 
  AIContextAnalysis,
  BriefGeneration 
} from './ClaudeAPIService';

// Service function interfaces
export interface OrganizationContext {
  organization: string;
  industry: string;
  role: string;
}

export interface ChatContext {
  organization: string;
  industry: string;
  userRole: string;
  aiStance: string;
  organizationContext: string;
  previousOpportunities: string;
  conversationHistory: Array<{ role: string; content: string }>;
  userMessage: string;
}

// Research organization with web search
export const researchOrganization = async (context: OrganizationContext): Promise<OrganizationResearchResult> => {
  if (!claudeAPIService.isAPIAvailable()) {
    throw new Error('Claude API is not available. Please ensure your API key is configured correctly.');
  }
  
  return await claudeAPIService.researchOrganization(context);
};

// Analyze AI context and progressiveness
export const analyzeAIContext = async (contextData: {
  organization: string;
  industry: string;
  role: string;
  aiStance: string;
  organizationDescription: string;
  innovationCulture: string;
  aiSentiment: string;
  researchData?: OrganizationResearchResult;
}): Promise<AIContextAnalysis> => {
  if (!claudeAPIService.isAPIAvailable()) {
    throw new Error('Claude API is not available. Please ensure your API key is configured correctly.');
  }
  
  return await claudeAPIService.analyzeAIContext(contextData);
};

// Enhanced chat response with Claude API
export const getChatResponse = async (context: ChatContext): Promise<string> => {
  if (!claudeAPIService.isAPIAvailable()) {
    throw new Error('Claude API is not available. Please ensure your API key is configured correctly.');
  }
  
  return await claudeAPIService.getChatResponse(context);
};

// Define page chat response
export const getDefineResponse = async (context: {
  organization: string;
  industry: string;
  selectedChallenge: string;
  currentBrief: string;
  successVision: string;
  conversationHistory: string;
  userMessage: string;
}): Promise<string> => {
  if (!claudeAPIService.isAPIAvailable()) {
    throw new Error('Claude API is not available. Please ensure your API key is configured correctly.');
  }
  
  return await claudeAPIService.getDefineResponse(context);
};

// Enhanced brief generation
export const generateBrief = async (context: {
  organization: string;
  industry: string;
  aiStance: string;
  organizationContext: string;
  selectedChallenge: any;
  successVision: string;
}): Promise<BriefGeneration> => {
  if (!claudeAPIService.isAPIAvailable()) {
    throw new Error('Claude API is not available. Please ensure your API key is configured correctly.');
  }
  
  return await claudeAPIService.generateBrief(context);
};

// Legacy function for backward compatibility
export const callClaude = async (promptType: string, context = {}): Promise<any> => {
  switch (promptType) {
    case 'contextAnalysis':
      if (context && typeof context === 'object' && 'organization' in context) {
        return await analyzeAIContext(context as any);
      }
      throw new Error('Invalid context for contextAnalysis');
    case 'challengeIdentification':
      throw new Error('challengeIdentification is now handled by getChatResponse');
    case 'briefGeneration':
      if (context && typeof context === 'object') {
        return await generateBrief(context as any);
      }
      throw new Error('Invalid context for briefGeneration');
    default:
      throw new Error(`Unknown prompt type: ${promptType}`);
  }
};

// Email service
export const sendDiscoveryBrief = async (briefData: any, userEmail: string): Promise<boolean> => {
  console.log(`Sending brief to ${userEmail}`, briefData);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};