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
  // Direct API URL - requires backend proxy due to CORS
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
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze message content for context
    const contexts = {
      accounting: ['accounting', 'finance', 'invoice', 'payment', 'reconciliation', 'audit', 'financial', 'expense', 'budget'],
      process: ['process', 'workflow', 'procedure', 'manual', 'automate', 'efficiency', 'bottleneck', 'streamline'],
      reporting: ['report', 'dashboard', 'metrics', 'kpi', 'analytics', 'insight', 'data', 'visualization'],
      customer: ['customer', 'client', 'satisfaction', 'experience', 'support', 'service', 'feedback'],
      technology: ['system', 'software', 'integration', 'api', 'database', 'technology', 'digital', 'platform'],
      team: ['team', 'employee', 'staff', 'collaboration', 'communication', 'training', 'onboarding'],
      growth: ['growth', 'scale', 'expand', 'revenue', 'sales', 'market', 'opportunity', 'strategic']
    };
    
    // Determine primary context
    let primaryContext = 'general';
    let contextScore = 0;
    
    for (const [context, keywords] of Object.entries(contexts)) {
      const score = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (score > contextScore) {
        contextScore = score;
        primaryContext = context;
      }
    }
    
    // Generate contextual response
    let response = '';
    let followUpQuestions: string[] = [];
    let contentExtractions: any = {};
    
    switch (primaryContext) {
      case 'accounting':
        if (lowerMessage.includes('invoice') || lowerMessage.includes('payment')) {
          response = "I understand you're dealing with invoice or payment processing challenges. Let me help you think through this systematically.\n\nFirst, can you walk me through your current invoice processing workflow? Specifically:\n- How many invoices do you process monthly?\n- What's the average processing time per invoice?\n- Where do most delays or errors occur?\n\nBased on what you've shared, I'm seeing an opportunity to streamline your accounts payable process. Many organizations find that automating invoice capture and approval workflows can reduce processing time by 60-80%.";
          followUpQuestions = [
            "What's your current approval chain for invoices?",
            "Do you have issues with duplicate payments or missing invoices?",
            "How do you currently handle vendor communications?"
          ];
        } else if (lowerMessage.includes('reconciliation')) {
          response = "Reconciliation challenges can significantly impact financial accuracy and team productivity. Let's dig deeper into your specific pain points.\n\nFrom your description, it sounds like manual reconciliation is consuming valuable time. A few clarifying questions:\n- Which accounts take the most time to reconcile?\n- How often do you perform reconciliations?\n- What tools are you currently using?\n\nI've seen organizations transform their reconciliation process by implementing automated matching rules and exception-based workflows. This typically reduces reconciliation time by 70% while improving accuracy.";
          followUpQuestions = [
            "What percentage of transactions require manual intervention?",
            "How do you currently handle reconciliation exceptions?",
            "What's your month-end close timeline?"
          ];
        } else {
          response = "Financial process optimization is crucial for organizational efficiency. Based on your message about accounting challenges, I'd like to understand more about your specific situation.\n\nWhat aspects of your accounting processes are causing the most friction? Common areas I see include:\n- Manual data entry and rekeying\n- Lack of real-time visibility\n- Compliance and audit preparation\n- Integration between systems\n\nOnce we identify the core issues, we can develop targeted solutions that deliver measurable ROI.";
          followUpQuestions = [
            "Which accounting tasks consume the most time?",
            "How many systems do you use for financial data?",
            "What are your biggest compliance concerns?"
          ];
        }
        break;
        
      case 'process':
        if (lowerMessage.includes('manual') || lowerMessage.includes('automate')) {
          response = "Manual processes are often the biggest impediment to scaling operations efficiently. I can help you identify automation opportunities.\n\nTo better understand your situation:\n- How many people are involved in this process?\n- How many times per day/week is it performed?\n- What systems or tools are currently used?\n\nBased on your description, there's likely significant opportunity for automation. Organizations typically see 40-60% time savings when moving from manual to automated workflows, plus improved accuracy and employee satisfaction.";
          followUpQuestions = [
            "What triggers the start of this process?",
            "Where do errors most commonly occur?",
            "What would your team do with the time saved?"
          ];
          
          if (lowerMessage.includes('opportunity') || lowerMessage.includes('improve')) {
            contentExtractions = {
              title: "Manual Process Automation Opportunity",
              description: "Current manual processes are creating inefficiencies and bottlenecks that could be addressed through automation",
              successVision: "Automated workflow reducing manual effort by 50% and improving process accuracy"
            };
          }
        } else {
          response = "Process improvement is fundamental to operational excellence. Let's explore your specific process challenges.\n\nFrom what you've shared, I'm hearing concerns about efficiency. To provide targeted recommendations:\n- What's the end-to-end process flow?\n- Where are the biggest delays or bottlenecks?\n- How do you currently measure process performance?\n\nMany organizations find that simply mapping their processes reveals immediate improvement opportunities. We can then prioritize based on impact and effort.";
          followUpQuestions = [
            "Who owns this process currently?",
            "What's the business impact of the current inefficiency?",
            "Have you attempted improvements before?"
          ];
        }
        break;
        
      case 'reporting':
        response = "Data-driven decision making starts with effective reporting. I can help you transform your reporting capabilities.\n\nBased on your message, let's clarify a few things:\n- Who are the primary consumers of these reports?\n- How frequently are reports needed?\n- What decisions are made based on this data?\n\nModern reporting solutions can provide real-time insights, self-service analytics, and automated distribution. This typically reduces report preparation time by 80% while providing more actionable insights.";
        followUpQuestions = [
          "What data sources need to be included?",
          "How much time is spent on report preparation?",
          "What KPIs are most critical to track?"
        ];
        break;
        
      case 'customer':
        response = "Customer experience is a critical differentiator in today's market. Let's explore how to enhance your customer interactions.\n\nTo better understand your needs:\n- What specific touchpoints are problematic?\n- How do you currently measure customer satisfaction?\n- What feedback have you received from customers?\n\nImproving customer experience often yields multiple benefits: increased retention, higher lifetime value, and positive word-of-mouth. Even small improvements can have significant impact.";
        followUpQuestions = [
          "What's your current customer retention rate?",
          "How do customers prefer to interact with you?",
          "What are the most common customer complaints?"
        ];
        break;
        
      case 'technology':
        response = "Technology transformation can unlock significant value when aligned with business objectives. Let's explore your technology challenges.\n\nFrom your message, I'm gathering you're dealing with system or integration issues. To provide specific guidance:\n- What systems are involved?\n- What's the main business impact?\n- What's your timeline for resolution?\n\nThe right technical solution can eliminate manual workarounds, improve data accuracy, and enable new capabilities. The key is ensuring technology serves your business needs, not the other way around.";
        followUpQuestions = [
          "What's your current technology stack?",
          "Are there security or compliance requirements?",
          "What's your budget range for solutions?"
        ];
        break;
        
      case 'team':
        response = "People are at the heart of every successful organization. Let's address your team-related challenges.\n\nTo understand the full picture:\n- What specific team dynamics are you concerned about?\n- How large is the team?\n- What's the current team structure?\n\nInvesting in team effectiveness typically yields 3-5x ROI through improved productivity, reduced turnover, and better outcomes. Small changes in collaboration or communication can have outsized impact.";
        followUpQuestions = [
          "What's the current team morale?",
          "Are roles and responsibilities clear?",
          "What tools does the team use to collaborate?"
        ];
        break;
        
      case 'growth':
        response = "Strategic growth requires careful planning and execution. I can help you identify and prioritize growth opportunities.\n\nBased on your message, let's explore:\n- What are your growth targets?\n- What constraints are you facing?\n- What's worked well in the past?\n\nSuccessful growth initiatives balance ambition with realistic execution. The key is identifying opportunities that leverage your existing strengths while addressing market needs.";
        followUpQuestions = [
          "What's your current market position?",
          "What resources are available for growth?",
          "How do you define success?"
        ];
        break;
        
      default:
        // Intelligent general response based on message length and structure
        if (userMessage.length < 50) {
          response = "I'd like to help you explore this further. Could you provide more context about your specific situation? For example:\n- What's the current challenge you're facing?\n- What's the impact on your team or organization?\n- What would success look like?\n\nThe more details you share, the more targeted my guidance can be.";
        } else if (userMessage.includes('?')) {
          response = "That's a thoughtful question. Let me help you think through this systematically.\n\nBased on what you're asking, there are several angles to consider:\n1. The immediate tactical response\n2. The strategic implications\n3. The change management aspects\n\nWhich aspect would be most valuable to explore first? I can provide specific frameworks and examples once I understand your priority.";
        } else {
          response = "Thank you for sharing this context. I can see there are several important factors at play here.\n\nTo provide the most relevant guidance, help me understand:\n- What's the desired outcome?\n- What's already been tried?\n- What constraints exist?\n\nOnce we clarify these points, I can offer specific recommendations based on similar situations I've seen succeed.";
        }
        followUpQuestions = [
          "What's the timeline for addressing this?",
          "Who are the key stakeholders?",
          "What does success look like to you?"
        ];
    }
    
    return {
      message: response,
      followUpQuestions: followUpQuestions,
      contentExtractions: contentExtractions
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