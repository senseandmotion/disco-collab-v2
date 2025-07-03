import type { ChatMessage, Opportunity, OpportunityCategory } from '../types';

export interface OrganizationResearchResult {
  organizationInfo: string;
  industryContext: string;
  challengesIdentified: string[];
  aiReadiness: string;
}

export interface AIContextAnalysis {
  progressiveness: number;
  contextInsights: string;
  recommendations: string[];
}

export interface BriefGeneration {
  problemStatement: string;
  opportunity: string;
  successIndicators: string[];
  nextSteps: string[];
}

export interface ChatResponse {
  message: string;
  suggestedActions?: string[];
  contentExtractions?: {
    title?: string;
    description?: string;
    successVision?: string;
  };
  followUpQuestions?: string[];
}

export interface CategoryAnalysis {
  categories: {
    id: string;
    name: string;
    description: string;
    opportunityIds: string[];
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  }[];
  mergeRecommendations: {
    opportunityIds: string[];
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
}

class ClaudeAPIService {
  private apiKey: string | null = null;
  private apiUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || null;
  }

  isAPIAvailable(): boolean {
    return this.apiKey !== null;
  }

  private async makeAPICall(messages: any[]): Promise<any> {
    if (!this.isAPIAvailable()) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async conductOpportunityInterview(
    sessionContext: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = `You are an AI assistant helping with business discovery sessions. Your role is to guide users through identifying and articulating business opportunities and challenges.

Session Context: ${sessionContext}

Guidelines:
- Ask strategic, open-ended questions to help users think deeper
- Help clarify problem statements and success criteria
- Suggest specific, measurable outcomes
- Keep responses focused and actionable
- Extract key information that can be used to populate opportunity forms

When you identify clear title, description, or success vision from the conversation, include them in your response for auto-population.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      if (this.isAPIAvailable()) {
        const response = await this.makeAPICall(messages);
        const content = response.content[0].text;
        
        // Try to extract structured information
        const titleMatch = content.match(/TITLE:\s*(.+)/i);
        const descMatch = content.match(/DESCRIPTION:\s*(.+)/i);
        const successMatch = content.match(/SUCCESS:\s*(.+)/i);

        return {
          message: content,
          contentExtractions: {
            title: titleMatch?.[1]?.trim(),
            description: descMatch?.[1]?.trim(),
            successVision: successMatch?.[1]?.trim()
          },
          followUpQuestions: this.extractFollowUpQuestions(content)
        };
      } else {
        // Fallback to mock response
        return this.getMockChatResponse(userMessage);
      }
    } catch (error) {
      console.error('Claude API error:', error);
      return this.getMockChatResponse(userMessage);
    }
  }

  async analyzeOpportunities(
    opportunities: Opportunity[],
    sessionContext: string
  ): Promise<CategoryAnalysis> {
    try {
      const systemPrompt = `You are analyzing business opportunities for categorization and potential merging. 

Session Context: ${sessionContext}

Your task:
1. Group similar opportunities into logical categories (3-7 categories max)
2. Suggest mergers for very similar opportunities
3. Provide confidence scores and reasoning

Return analysis in this format:
CATEGORIES:
[Category Name]: [Description] - [Opportunity IDs] - Confidence: [High/Medium/Low] - Reasoning: [Why these belong together]

MERGERS:
[Opportunity IDs to merge]: [Reasoning] - Confidence: [High/Medium/Low]`;

      const opportunitiesText = opportunities.map(opp => 
        `ID: ${opp.id}\nTitle: ${opp.title}\nDescription: ${opp.description}\nSuccess Vision: ${opp.successVision}\n---`
      ).join('\n');

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze these opportunities:\n\n${opportunitiesText}` }
      ];

      if (this.isAPIAvailable()) {
        const response = await this.makeAPICall(messages);
        return this.parseAnalysisResponse(response.content[0].text, opportunities);
      } else {
        return this.getMockAnalysis(opportunities);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      return this.getMockAnalysis(opportunities);
    }
  }

  async researchOrganization(context: {
    organization: string;
    industry: string;
    role: string;
  }): Promise<OrganizationResearchResult> {
    // For now, use mock implementation as this is secondary feature
    await this.simulateAPIDelay();
    
    return {
      organizationInfo: `${context.organization} is a leading company in the ${context.industry} industry.`,
      industryContext: `The ${context.industry} sector is experiencing rapid digital transformation.`,
      challengesIdentified: [
        'Digital transformation initiatives',
        'Customer experience optimization',
        'Operational efficiency improvements',
        'Data-driven decision making'
      ],
      aiReadiness: 'The organization shows moderate readiness for AI adoption with room for growth.'
    };
  }

  async analyzeAIContext(contextData: any): Promise<AIContextAnalysis> {
    await this.simulateAPIDelay();
    
    const progressiveness = contextData.aiStance === 'progressive' ? 0.8 : 
                           contextData.aiStance === 'moderate' ? 0.5 : 0.3;
    
    return {
      progressiveness,
      contextInsights: `Based on the ${contextData.aiStance} stance and industry context, there are significant opportunities for AI-driven innovation.`,
      recommendations: [
        'Start with pilot projects to demonstrate value',
        'Focus on use cases with clear ROI',
        'Build AI literacy across the organization',
        'Establish governance frameworks early'
      ]
    };
  }

  async getChatResponse(context: any): Promise<string> {
    await this.simulateAPIDelay();
    
    // Mock collaborative discovery responses
    const responses = [
      "That's an interesting challenge. Could you elaborate on the specific pain points your team faces?",
      "I see the opportunity here. How do you think this would impact your organization's goals?",
      "Have you considered how other departments might benefit from solving this problem?",
      "What would success look like for this initiative in 6 months?",
      "Let's explore the root causes of this challenge together."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async getDefineResponse(context: any): Promise<string> {
    await this.simulateAPIDelay();
    
    return `Based on your input about "${context.selectedChallenge}", I can help you refine the problem statement and identify key success metrics. What specific outcomes are most important to your team?`;
  }

  async generateBrief(context: any): Promise<BriefGeneration> {
    await this.simulateAPIDelay();
    
    return {
      problemStatement: `The organization needs to address ${context.selectedChallenge.title} to improve operational efficiency and competitive advantage.`,
      opportunity: `By solving this challenge, ${context.organization} can unlock new growth opportunities and enhance stakeholder value.`,
      successIndicators: [
        'Reduced operational costs by 20%',
        'Improved customer satisfaction scores',
        'Faster time-to-market for new initiatives',
        'Enhanced team collaboration and productivity'
      ],
      nextSteps: [
        'Form a cross-functional team',
        'Define clear success metrics',
        'Create a pilot project plan',
        'Establish regular review cycles'
      ]
    };
  }

  // Helper methods
  private extractFollowUpQuestions(content: string): string[] {
    const questions = content.match(/\?[^?]*\?/g) || [];
    return questions.slice(0, 3).map(q => q.trim());
  }

  private getMockChatResponse(userMessage: string): ChatResponse {
    const responses = [
      "That's an interesting challenge. Could you elaborate on the specific pain points your team faces?",
      "I see the opportunity here. How do you think this would impact your organization's goals?",
      "Have you considered how other departments might benefit from solving this problem?",
      "What would success look like for this initiative in 6 months?",
      "Let's explore the root causes of this challenge together.",
      "Can you help me understand the current process and where the bottlenecks occur?",
      "What stakeholders would be most affected by this change?",
      "How do you currently measure success in this area?"
    ];
    
    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      followUpQuestions: [
        "What specific metrics would indicate success?",
        "Who else should be involved in solving this?",
        "What resources would be needed?"
      ]
    };
  }

  private parseAnalysisResponse(content: string, opportunities: Opportunity[]): CategoryAnalysis {
    // Simple parsing - in real implementation would be more robust
    const categories = [];
    const mergeRecommendations = [];

    // For now, create mock categories based on content
    if (opportunities.length > 0) {
      categories.push({
        id: 'cat-1',
        name: 'Process Optimization',
        description: 'Opportunities focused on improving operational efficiency',
        opportunityIds: opportunities.slice(0, Math.ceil(opportunities.length / 2)).map(o => o.id),
        confidence: 'high' as const,
        reasoning: 'These opportunities share common themes around process improvement'
      });

      if (opportunities.length > 1) {
        categories.push({
          id: 'cat-2',
          name: 'Technology Enhancement',
          description: 'Opportunities involving technology solutions',
          opportunityIds: opportunities.slice(Math.ceil(opportunities.length / 2)).map(o => o.id),
          confidence: 'medium' as const,
          reasoning: 'These opportunities involve technological improvements'
        });
      }
    }

    return { categories, mergeRecommendations };
  }

  private getMockAnalysis(opportunities: Opportunity[]): CategoryAnalysis {
    return this.parseAnalysisResponse('', opportunities);
  }

  private simulateAPIDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
  }
}

export default new ClaudeAPIService();