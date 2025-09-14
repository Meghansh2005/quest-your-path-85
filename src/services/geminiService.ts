import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyA3CPDfX5JAaf-xbG7K8p24BkMmtPAQpJA';
const genAI = new GoogleGenerativeAI(API_KEY);

// System prompts for different analysis types
const SYSTEM_PROMPTS = {
  CAREER_COUNSELOR: `You are a senior career counselor with 20+ years experience. 
    Analyze user responses for: skill patterns, learning preferences, work environment fit, growth potential. 
    Provide actionable insights in JSON format.`,
    
  SKILL_ANALYST: `You are a psychometric analyst specializing in skill assessment. 
    Analyze response patterns to identify underlying competencies, transferable skills, 
    and skill complementarity. Return structured analysis.`,
    
  MARKET_INTELLIGENCE: `You are an industry research analyst. Generate current market 
    insights including: job demand, salary ranges, required skills, emerging opportunities, 
    industry challenges. Focus on actionable data.`,
    
  QUESTION_GENERATOR: `You are an expert assessment designer. Generate adaptive questions 
    that reveal deep insights about skills, preferences, and career fit. 
    Create branching logic for deeper exploration.`,
    
  PERSONAL_COACH: `You are a personal development coach. Create specific, measurable 
    development plans based on user's skill gaps and career goals. 
    Include timelines and actionable steps.`
};

export interface CareerAnalysis {
  skillPatterns: string[];
  careerRecommendations: CareerRecommendation[];
  skillGaps: SkillGap[];
  learningPath: LearningStep[];
  personalityProfile: PersonalityTrait[];
  marketInsights: MarketInsight[];
}

export interface CareerRecommendation {
  title: string;
  field: string;
  matchScore: number;
  description: string;
  salaryRange: string;
  growthProspects: string;
  requiredSkills: string[];
  timeToTransition: string;
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  developmentTime: string;
}

export interface LearningStep {
  skill: string;
  action: string;
  resources: string[];
  timeline: string;
  measurableOutcome: string;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  description: string;
  careerImplications: string[];
}

export interface MarketInsight {
  industry: string;
  demandLevel: string;
  averageSalary: string;
  growthRate: string;
  keyTrends: string[];
  emergingRoles: string[];
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'scenario' | 'ranking';
  options?: string[];
  scenario?: string;
  followUpTriggers?: string[];
  skillsAssessed: string[];
  difficultyLevel: number;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  private conversationHistory: string[] = [];

  // Add context to conversation history
  addToContext(userInput: string, aiResponse: string) {
    this.conversationHistory.push(`User: ${userInput}`);
    this.conversationHistory.push(`AI: ${aiResponse}`);
    
    // Keep only last 10 exchanges to manage context size
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  // Generate adaptive questions based on user responses
  async generateAdaptiveQuestions(
    selectedSkills: string[],
    previousAnswers: any[],
    phase: 'initial' | 'deep-dive' | 'validation'
  ): Promise<AdaptiveQuestion[]> {
    const context = this.conversationHistory.join('\n');
    const prompt = `
      ${SYSTEM_PROMPTS.QUESTION_GENERATOR}
      
      Context: ${context}
      Selected Skills: ${selectedSkills.join(', ')}
      Previous Answers: ${JSON.stringify(previousAnswers)}
      Assessment Phase: ${phase}
      
      Generate 5 adaptive questions that:
      1. Build on previous responses
      2. Explore ${phase === 'initial' ? 'broad skill assessment' : phase === 'deep-dive' ? 'detailed competencies' : 'validation of insights'}
      3. Use varied question types (scenarios, rankings, scales)
      4. Adapt difficulty based on user engagement
      
      Return as JSON array with this structure:
      {
        "questions": [
          {
            "id": "unique_id",
            "question": "question text",
            "type": "multiple-choice|scale|scenario|ranking",
            "options": ["option1", "option2"] (if applicable),
            "scenario": "scenario description" (if applicable),
            "skillsAssessed": ["skill1", "skill2"],
            "difficultyLevel": 1-5
          }
        ]
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      this.addToContext(prompt, response);
      
      const parsed = JSON.parse(response);
      return parsed.questions;
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      return this.getFallbackQuestions(selectedSkills, phase);
    }
  }

  // Analyze user responses for comprehensive career insights
  async analyzeCareerFit(
    selectedSkills: string[],
    questionResponses: any[],
    userProfile: any
  ): Promise<CareerAnalysis> {
    const context = this.conversationHistory.join('\n');
    const prompt = `
      ${SYSTEM_PROMPTS.CAREER_COUNSELOR}
      
      Conversation Context: ${context}
      
      User Profile:
      - Selected Skills: ${selectedSkills.join(', ')}
      - Assessment Responses: ${JSON.stringify(questionResponses)}
      - Additional Info: ${JSON.stringify(userProfile)}
      
      Perform comprehensive career analysis and return JSON with:
      {
        "skillPatterns": ["pattern1", "pattern2"],
        "careerRecommendations": [
          {
            "title": "Job Title",
            "field": "Industry",
            "matchScore": 85,
            "description": "Role description",
            "salaryRange": "$60k-$90k",
            "growthProspects": "Strong growth expected",
            "requiredSkills": ["skill1", "skill2"],
            "timeToTransition": "6-12 months"
          }
        ],
        "skillGaps": [
          {
            "skill": "Python Programming",
            "currentLevel": 3,
            "requiredLevel": 7,
            "priority": "high",
            "developmentTime": "3-6 months"
          }
        ],
        "learningPath": [
          {
            "skill": "Leadership",
            "action": "Take online course",
            "resources": ["Coursera Leadership", "Internal mentoring"],
            "timeline": "Next 3 months",
            "measurableOutcome": "Complete project leadership role"
          }
        ],
        "personalityProfile": [
          {
            "trait": "Analytical Thinking",
            "score": 8,
            "description": "Strong problem-solving abilities",
            "careerImplications": ["Research roles", "Data analysis", "Strategy"]
          }
        ],
        "marketInsights": [
          {
            "industry": "Technology",
            "demandLevel": "High",
            "averageSalary": "$85,000",
            "growthRate": "15% annually",
            "keyTrends": ["AI adoption", "Remote work"],
            "emergingRoles": ["AI Trainer", "Data Scientist"]
          }
        ]
      }
      
      Provide detailed, actionable insights based on the user's responses.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      this.addToContext(prompt, response);
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error analyzing career fit:', error);
      return this.getFallbackAnalysis(selectedSkills);
    }
  }

  // Generate workplace scenarios based on user's field of interest
  async generateWorkplaceScenario(
    fieldOfInterest: string,
    userBackground: any,
    previousScenarios: string[] = []
  ): Promise<{
    scenario: string;
    context: string;
    challenge: string;
    options: Array<{
      id: string;
      text: string;
      skills: string[];
      personality: string[];
    }>;
    followUpQuestions: string[];
  }> {
    const context = this.conversationHistory.join('\n');
    const prompt = `
      ${SYSTEM_PROMPTS.MARKET_INTELLIGENCE}
      
      Context: ${context}
      Field of Interest: ${fieldOfInterest}
      User Background: ${JSON.stringify(userBackground)}
      Previous Scenarios: ${previousScenarios.join(', ')}
      
      Generate a realistic workplace scenario for ${fieldOfInterest} that:
      1. Reflects current industry challenges
      2. Reveals problem-solving approach
      3. Tests leadership and communication skills
      4. Includes 4 response options with different skill implications
      
      Return JSON:
      {
        "scenario": "Title of scenario",
        "context": "Detailed situation description",
        "challenge": "Specific challenge to address",
        "options": [
          {
            "id": "A",
            "text": "Response option",
            "skills": ["skill1", "skill2"],
            "personality": ["trait1", "trait2"]
          }
        ],
        "followUpQuestions": ["question1", "question2"]
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      this.addToContext(prompt, response);
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error generating workplace scenario:', error);
      return this.getFallbackScenario(fieldOfInterest);
    }
  }

  // Analyze scenario responses for personality insights
  async analyzeScenarioResponses(
    fieldOfInterest: string,
    scenarioResponses: Array<{
      scenario: string;
      selectedOption: any;
      reasoning?: string;
    }>
  ): Promise<{
    personalityProfile: PersonalityTrait[];
    workStylePreferences: string[];
    leadershipStyle: string;
    problemSolvingApproach: string;
    careerRecommendations: CareerRecommendation[];
    developmentAreas: string[];
  }> {
    const context = this.conversationHistory.join('\n');
    const prompt = `
      ${SYSTEM_PROMPTS.PERSONAL_COACH}
      
      Context: ${context}
      Field: ${fieldOfInterest}
      Scenario Responses: ${JSON.stringify(scenarioResponses)}
      
      Analyze the user's decision patterns and provide comprehensive personality analysis:
      
      Return JSON:
      {
        "personalityProfile": [
          {
            "trait": "Decision Making Style",
            "score": 8,
            "description": "Data-driven and analytical",
            "careerImplications": ["Strategy roles", "Research positions"]
          }
        ],
        "workStylePreferences": ["Collaborative", "Detail-oriented"],
        "leadershipStyle": "Collaborative leader who values team input",
        "problemSolvingApproach": "Systematic and research-based",
        "careerRecommendations": [
          {
            "title": "Product Manager",
            "field": "${fieldOfInterest}",
            "matchScore": 92,
            "description": "Lead product development",
            "salaryRange": "$80k-$120k",
            "growthProspects": "Excellent",
            "requiredSkills": ["Leadership", "Analytics"],
            "timeToTransition": "1-2 years"
          }
        ],
        "developmentAreas": ["Public speaking", "Negotiation skills"]
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      this.addToContext(prompt, response);
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error analyzing scenario responses:', error);
      return this.getFallbackScenarioAnalysis(fieldOfInterest);
    }
  }

  // Fallback methods for error handling
  private getFallbackQuestions(skills: string[], phase: string): AdaptiveQuestion[] {
    return [
      {
        id: 'fallback-1',
        question: `In your experience with ${skills[0]}, what motivates you most?`,
        type: 'multiple-choice',
        options: ['Solving complex problems', 'Working with people', 'Creating something new', 'Achieving measurable results'],
        skillsAssessed: [skills[0]],
        difficultyLevel: 3
      },
      {
        id: 'fallback-2',
        question: 'How do you prefer to learn new skills?',
        type: 'multiple-choice',
        options: ['Hands-on practice', 'Reading and research', 'Learning from others', 'Trial and error'],
        skillsAssessed: ['Learning Style'],
        difficultyLevel: 2
      }
    ];
  }

  private getFallbackAnalysis(skills: string[]): CareerAnalysis {
    return {
      skillPatterns: ['Strong analytical abilities', 'Good communication skills'],
      careerRecommendations: [{
        title: 'Business Analyst',
        field: 'Technology',
        matchScore: 75,
        description: 'Analyze business requirements and processes',
        salaryRange: '$60,000 - $85,000',
        growthProspects: 'Strong growth expected',
        requiredSkills: skills.slice(0, 3),
        timeToTransition: '6-12 months'
      }],
      skillGaps: [],
      learningPath: [],
      personalityProfile: [],
      marketInsights: []
    };
  }

  private getFallbackScenario(field: string) {
    return {
      scenario: `${field} Team Challenge`,
      context: `You're working on a project in ${field} when an unexpected challenge arises.`,
      challenge: 'How do you approach this situation?',
      options: [
        { id: 'A', text: 'Analyze the problem systematically', skills: ['Analysis'], personality: ['Methodical'] },
        { id: 'B', text: 'Consult with team members', skills: ['Communication'], personality: ['Collaborative'] },
        { id: 'C', text: 'Research similar cases', skills: ['Research'], personality: ['Thorough'] },
        { id: 'D', text: 'Propose an innovative solution', skills: ['Creativity'], personality: ['Innovative'] }
      ],
      followUpQuestions: ['What factors would you consider?', 'How would you measure success?']
    };
  }

  private getFallbackScenarioAnalysis(field: string) {
    return {
      personalityProfile: [{
        trait: 'Problem Solving',
        score: 7,
        description: 'Systematic approach to challenges',
        careerImplications: ['Analytical roles', 'Project management']
      }],
      workStylePreferences: ['Structured environment', 'Clear objectives'],
      leadershipStyle: 'Collaborative',
      problemSolvingApproach: 'Analytical',
      careerRecommendations: [{
        title: `${field} Specialist`,
        field: field,
        matchScore: 80,
        description: `Work as a specialist in ${field}`,
        salaryRange: '$50,000 - $75,000',
        growthProspects: 'Good',
        requiredSkills: ['Domain expertise'],
        timeToTransition: '1-2 years'
      }],
      developmentAreas: ['Leadership skills', 'Communication']
    };
  }
}

export const geminiService = new GeminiService();
