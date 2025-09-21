import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDF58zTsnxznqtmLfNqLdLmwpRfkp6B_tU';
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

export interface QuizResponse {
  questionId: string;
  question: string;
  answer: any;
  reasoning?: string;
  skillsAssessed: string[];
  timestamp: Date;
}

export interface CareerAnalysis {
  overallScore: number;
  topStrengths: string[];
  skillGaps: string[];
  careerRecommendations: CareerRecommendation[];
  developmentPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  marketInsights: {
    demandLevel: string;
    competitionLevel: string;
    trendingSkills: string[];
  };
  skillPatterns?: string[];
  learningPath?: any[];
  personalityProfile?: any[];
}

export interface CareerRecommendation {
  title: string;
  match: number;
  description: string;
  salaryRange: string;
  growthOutlook: string;
  field?: string;
  matchScore?: number;
  growthProspects?: string;
  requiredSkills?: string[];
  timeToTransition?: string;
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scale' | 'scenario' | 'ranking';
  options?: string[];
  scenario?: string;
  skillsAssessed: string[];
  difficulty: number;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    }
  });
  private conversationHistory: string[] = [];

  private async makeStructuredRequest(prompt: string): Promise<any> {
    console.log('🚀 Sending request to Gemini API...');
    console.log('Prompt:', prompt.substring(0, 200) + '...');
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      console.log('✅ Received response from Gemini API');
      console.log('Response preview:', response.substring(0, 200) + '...');
      
      // Clean up response to ensure valid JSON
      const cleanResponse = this.extractJSON(response);
      if (!cleanResponse) {
        throw new Error('No valid JSON found in response');
      }
      const parsed = JSON.parse(cleanResponse);
      console.log('✅ Successfully parsed JSON response');
      
      return parsed;
    } catch (error) {
      console.error('❌ Error with Gemini API:', error);
      // Return fallback data instead of throwing
      console.log('🔄 Using fallback data due to API error');
      return null;
    }
  }

  private extractJSON(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }
    
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    // If no JSON found, try to clean up the response
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/, '').replace(/```$/, '');
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/, '').replace(/```$/, '');
    }
    
    return cleaned;
  }

  // Add context to conversation history
  addToContext(userInput: string, aiResponse: string) {
    this.conversationHistory.push(`User: ${userInput}`);
    this.conversationHistory.push(`AI: ${aiResponse}`);
    
    console.log('📝 Added to conversation context');
    console.log(`Total context length: ${this.conversationHistory.length} exchanges`);
    
    // Keep only last 10 exchanges to manage context size
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
      console.log('✂️ Trimmed conversation history to manage size');
    }
  }

  // Generate adaptive questions based on user responses
  async generateAdaptiveQuestions(
    selectedSkills: string[],
    previousAnswers: any[],
    phase: 'initial' | 'deep-dive' | 'validation'
  ): Promise<AdaptiveQuestion[]> {
    console.log('🎯 Generating adaptive questions for phase:', phase);
    console.log('Selected skills:', selectedSkills);
    console.log('Previous answers count:', previousAnswers.length);
    
    const context = this.conversationHistory.join('\n');
    const timestamp = Date.now();
    
    const prompt = `
      ${SYSTEM_PROMPTS.QUESTION_GENERATOR}
      
      IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
      
      Selected Skills: ${selectedSkills.join(', ')}
      Previous Answers Count: ${previousAnswers.length}
      Assessment Phase: ${phase}
      
      Generate 3 adaptive questions that:
      1. Build on previous responses
      2. Explore ${phase === 'initial' ? 'broad skill assessment' : phase === 'deep-dive' ? 'detailed competencies' : 'validation of insights'}
      3. Use varied question types (scenarios, rankings, scales)
      4. Adapt difficulty based on user engagement
      
      Return ONLY this JSON structure (no markdown, no extra text):
      {
        "questions": [
          {
            "id": "q_${timestamp}_1",
            "question": "What motivates you most when working with ${selectedSkills[0] || 'problem-solving'}?",
            "type": "multiple-choice",
            "options": ["Solving complex problems", "Collaborating with others", "Creating innovative solutions", "Achieving measurable results"],
            "skillsAssessed": ["${selectedSkills[0] || 'motivation'}"],
            "difficultyLevel": 3
          },
          {
            "id": "q_${timestamp}_2", 
            "question": "Rate your confidence in handling unexpected challenges in your field",
            "type": "scale",
            "skillsAssessed": ["adaptability", "confidence"],
            "difficultyLevel": 2
          },
          {
            "id": "q_${timestamp}_3",
            "question": "You're leading a project that's falling behind schedule. What's your first action?",
            "type": "scenario",
            "scenario": "Your team is working on an important project with a tight deadline. You realize you're 20% behind schedule with only 2 weeks left.",
            "options": ["Analyze what's causing delays", "Increase team working hours", "Request deadline extension", "Redistribute tasks among team"],
            "skillsAssessed": ["leadership", "problem-solving"],
            "difficultyLevel": 4
          }
        ]
      }
    `;

    try {
      const result = await this.makeStructuredRequest(prompt);
      
      if (result && result.questions && Array.isArray(result.questions)) {
        console.log('✅ Generated', result.questions.length, 'questions from Gemini API');
        this.addToContext(`Generated ${result.questions.length} questions for ${phase}`, JSON.stringify(result.questions));
        return result.questions;
      } else {
        console.log('⚠️ Invalid response from Gemini API, using fallback questions');
        return this.getFallbackQuestions(selectedSkills, phase);
      }
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
      
      IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
      
      Conversation Context: ${context}
      
      User Profile:
      - Selected Skills: ${selectedSkills.join(', ')}
      - Assessment Responses: ${JSON.stringify(questionResponses)}
      - Additional Info: ${JSON.stringify(userProfile)}
      
      Perform comprehensive career analysis and return ONLY this JSON structure:
      {
        "skillPatterns": ["Strong analytical thinking", "Excellent communication skills", "Creative problem-solving approach"],
        "careerRecommendations": [
          {
            "title": "Data Analyst",
            "field": "Technology",
            "matchScore": 87,
            "description": "Analyze complex data sets to drive business decisions and insights",
            "salaryRange": "$65,000 - $95,000",
            "growthProspects": "High demand with 15% annual growth expected",
            "requiredSkills": ["Python", "SQL", "Statistics", "Data visualization"],
            "timeToTransition": "6-12 months with targeted learning"
          },
          {
            "title": "Product Manager",
            "field": "Technology",
            "matchScore": 82,
            "description": "Lead product development and strategy for digital products",
            "salaryRange": "$80,000 - $120,000",
            "growthProspects": "Strong growth in tech sector",
            "requiredSkills": ["Leadership", "Analytics", "User research", "Agile methodologies"],
            "timeToTransition": "12-18 months with experience building"
          },
          {
            "title": "UX Designer",
            "field": "Design & Technology",
            "matchScore": 78,
            "description": "Design user-centered digital experiences and interfaces",
            "salaryRange": "$70,000 - $105,000", 
            "growthProspects": "Growing demand for digital experiences",
            "requiredSkills": ["Design thinking", "Prototyping", "User research", "Collaboration"],
            "timeToTransition": "8-15 months with portfolio development"
          }
        ],
        "skillGaps": [
          {
            "skill": "Advanced Analytics",
            "currentLevel": 4,
            "requiredLevel": 7,
            "priority": "high",
            "developmentTime": "4-6 months"
          },
          {
            "skill": "Leadership Experience",
            "currentLevel": 3,
            "requiredLevel": 6,
            "priority": "medium",
            "developmentTime": "6-12 months"
          }
        ],
        "learningPath": [
          {
            "skill": "Data Analysis",
            "action": "Complete Google Data Analytics Certificate",
            "resources": ["Coursera Google Certificate", "Kaggle Learn", "Python for Data Analysis book"],
            "timeline": "Next 4 months",
            "measurableOutcome": "Complete 3 data analysis projects and earn certificate"
          },
          {
            "skill": "Leadership Skills",
            "action": "Take leadership role in current projects",
            "resources": ["Internal mentoring program", "Leadership courses", "Cross-functional project opportunities"],
            "timeline": "6-12 months",
            "measurableOutcome": "Successfully lead 2 projects and receive positive team feedback"
          }
        ],
        "personalityProfile": [
          {
            "trait": "Analytical Thinking",
            "score": 8,
            "description": "Strong ability to break down complex problems systematically",
            "careerImplications": ["Research roles", "Data-driven positions", "Strategic planning roles"]
          },
          {
            "trait": "Collaboration Style",
            "score": 7,
            "description": "Works effectively in team environments and values input from others",
            "careerImplications": ["Team-based roles", "Cross-functional positions", "Client-facing opportunities"]
          },
          {
            "trait": "Learning Orientation",
            "score": 9,
            "description": "High motivation to continuously learn and adapt to new challenges",
            "careerImplications": ["Rapidly evolving fields", "Technology roles", "Growth-oriented positions"]
          }
        ],
        "marketInsights": [
          {
            "industry": "Technology",
            "demandLevel": "Very High",
            "averageSalary": "$85,000",
            "growthRate": "18% annually", 
            "keyTrends": ["AI and machine learning adoption", "Remote work transformation", "Data-driven decision making"],
            "emergingRoles": ["AI Product Manager", "Data Storyteller", "Digital Experience Designer"]
          },
          {
            "industry": "Healthcare Technology",
            "demandLevel": "High",
            "averageSalary": "$78,000",
            "growthRate": "12% annually",
            "keyTrends": ["Digital health solutions", "Telemedicine growth", "Health data analytics"],
            "emergingRoles": ["Healthcare UX Designer", "Health Data Analyst", "Digital Health Product Manager"]
          }
        ]
      }
    `;

    try {
      const result = await this.makeStructuredRequest(prompt);
      this.addToContext(prompt, JSON.stringify(result));
      return result;
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
      
      IMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.
      
      Context: ${context}
      Field of Interest: ${fieldOfInterest}
      User Background: ${JSON.stringify(userBackground)}
      Previous Scenarios: ${previousScenarios.join(', ')}
      
      Generate a realistic workplace scenario for ${fieldOfInterest} that:
      1. Reflects current industry challenges
      2. Reveals problem-solving approach
      3. Tests leadership and communication skills
      4. Includes 4 response options with different skill implications
      
      Return ONLY this JSON structure:
      {
        "scenario": "Cross-functional Team Collaboration Challenge",
        "context": "You're working as a ${fieldOfInterest} professional on a critical project that involves multiple departments. The project deadline is approaching, but there are conflicting priorities between teams. The marketing team wants more features, engineering is concerned about technical debt, and management is pressuring for an early release. Team morale is declining due to the pressure and uncertainty.",
        "challenge": "How do you navigate this complex situation to ensure project success while maintaining team cohesion and stakeholder satisfaction?",
        "options": [
          {
            "id": "A",
            "text": "Organize a cross-functional meeting to align priorities and create a shared roadmap with clear trade-offs",
            "skills": ["leadership", "communication", "strategic thinking", "conflict resolution"],
            "personality": ["collaborative", "diplomatic", "structured"]
          },
          {
            "id": "B", 
            "text": "Focus on delivering core functionality first and communicate realistic expectations to all stakeholders",
            "skills": ["prioritization", "stakeholder management", "practical thinking", "project management"],
            "personality": ["pragmatic", "decisive", "results-oriented"]
          },
          {
            "id": "C",
            "text": "Conduct individual meetings with each team lead to understand concerns and build consensus gradually",
            "skills": ["relationship building", "active listening", "negotiation", "empathy"],
            "personality": ["patient", "relationship-focused", "thorough"]
          },
          {
            "id": "D",
            "text": "Propose a phased approach with quick wins to demonstrate progress while addressing technical concerns",
            "skills": ["innovation", "strategic planning", "technical understanding", "adaptability"],
            "personality": ["creative", "flexible", "analytical"]
          }
        ],
        "followUpQuestions": [
          "How would you measure the success of your approach?",
          "What would you do if stakeholders still disagreed after your intervention?",
          "How would you prevent similar conflicts in future projects?"
        ]
      }
    `;

    try {
      const result = await this.makeStructuredRequest(prompt);
      this.addToContext(prompt, JSON.stringify(result));
      return result;
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
    console.log('🔄 Using fallback questions for phase:', phase);
    const timestamp = Date.now();
    
    const baseQuestions = [
      {
        id: `fallback_${timestamp}_1`,
        question: `When working with ${skills[0] || 'new challenges'}, what energizes you most?`,
        type: 'multiple-choice' as const,
        options: ['Solving complex problems', 'Collaborating with team members', 'Creating innovative solutions', 'Achieving measurable results'],
        skillsAssessed: [skills[0] || 'motivation'],
        difficulty: 3
      },
      {
        id: `fallback_${timestamp}_2`,
        question: 'How confident are you in adapting to unexpected changes at work?',
        type: 'scale' as const,
        skillsAssessed: ['adaptability', 'confidence'],
        difficulty: 2
      },
      {
        id: `fallback_${timestamp}_3`,
        question: 'Your team disagrees on the best approach to a project. What do you do?',
        type: 'multiple-choice' as const,
        options: ['Facilitate a team discussion to find consensus', 'Research best practices and present findings', 'Suggest trying multiple approaches in parallel', 'Escalate to management for guidance'],
        skillsAssessed: ['leadership', 'communication', 'problem-solving'],
        difficulty: 4
      }
    ];

    if (phase === 'deep-dive') {
      baseQuestions.push(
        {
          id: `fallback_${timestamp}_4`,
          question: `In your experience with ${skills[1] || 'teamwork'}, what's your biggest strength?`,
          type: 'multiple-choice' as const,
          options: ['Building relationships', 'Organizing workflows', 'Mentoring others', 'Driving results'],
          skillsAssessed: [skills[1] || 'teamwork'],
          difficulty: 3
        },
        {
          id: `fallback_${timestamp}_5`,
          question: 'How do you prefer to learn new skills for your career?',
          type: 'multiple-choice' as const,
          options: ['Hands-on practice and experimentation', 'Structured courses and certifications', 'Learning from mentors and colleagues', 'Reading and self-directed research'],
          skillsAssessed: ['learning-style', 'self-development'],
          difficulty: 2
        }
      );
    }

    return [
      ...baseQuestions.slice(0, phase === 'initial' ? 3 : 5)
    ];
  }

  private getFallbackDeepDiveQuestions(topSkills: string[]): AdaptiveQuestion[] {
    console.log('🔄 Using fallback deep-dive questions for skills:', topSkills);
    const timestamp = Date.now();
    
    const deepQuestions: AdaptiveQuestion[] = [];
    
    // Generate 15 questions per skill
    topSkills.forEach((skill, skillIndex) => {
      for (let i = 0; i < 15; i++) {
        deepQuestions.push({
          id: `deep_fallback_${timestamp}_${skillIndex}_${i}`,
          question: `Advanced ${skill} Question ${i + 1}: How would you rate your expertise in applying ${skill} in complex, high-stakes situations?`,
          type: 'multiple-choice',
          options: [
            'Expert level - I can mentor others and handle any situation',
            'Advanced - I\'m highly competent and confident',
            'Intermediate - I can handle most situations with some guidance',
            'Developing - I need more experience and support'
          ],
          skillsAssessed: [skill],
          difficulty: 4
        });
      }
    });
    
    console.log('✅ Generated', deepQuestions.length, 'fallback deep-dive questions');
    return deepQuestions;
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

export const geminiService = {
  // Generate initial 20 questions based on 5 selected skills
  async generateInitialQuestions(selectedSkills: string[]): Promise<AdaptiveQuestion[]> {
    try {
      console.log('🚀 Generating 20 initial questions for skills:', selectedSkills);
      
      const prompt = `You are an expert career counselor. Generate exactly 20 assessment questions to evaluate a person's proficiency in these 5 skills: ${selectedSkills.join(', ')}.

Create questions that will help identify which 2 skills are the person's strongest areas. Include:
- 4 questions per skill (20 total)
- Mix of multiple-choice, scenario-based, and scale questions
- Questions that reveal both technical knowledge and practical application
- Scenarios that test real-world problem-solving

Return ONLY a JSON array with this exact structure:
[{
  "id": "skill_assessment_1",
  "question": "detailed question text",
  "type": "multiple-choice",
  "options": ["option1", "option2", "option3", "option4"],
  "skillsAssessed": ["primary_skill"],
  "difficulty": 3,
  "scenario": "context if applicable"
}]`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📥 Generated 20 questions');
      
      const questions = JSON.parse(text);
      return questions.map((q: any, index: number) => ({
        id: q.id || `initial_${index + 1}`,
        question: q.question,
        type: q.type || 'multiple-choice',
        options: q.options || ['Strongly Agree', 'Agree', 'Neutral', 'Disagree'],
        skillsAssessed: q.skillsAssessed || [selectedSkills[Math.floor(index / 4)]],
        difficulty: q.difficulty || 3,
        scenario: q.scenario
      }));
    } catch (error) {
      console.error('❌ Error generating initial questions:', error);
      return [];
    }
  },

  // Analyze responses to find top 2 skills
  async findTopSkills(responses: QuizResponse[]): Promise<string[]> {
    try {
      console.log('🔍 Analyzing responses to find top 2 skills');
      
      const responseData = responses.map(r => ({
        question: r.question,
        answer: r.answer,
        skills: r.skillsAssessed,
        reasoning: r.reasoning
      }));

      const prompt = `Analyze these quiz responses and identify the TOP 2 skills where the person shows the highest proficiency and confidence.

Responses: ${JSON.stringify(responseData, null, 2)}

Based on:
- Answer quality and confidence
- Consistency across related questions  
- Practical knowledge demonstrated
- Problem-solving approach

Return ONLY a JSON array with the 2 strongest skills:
["skill1", "skill2"]`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const topSkills = JSON.parse(response.text());
      
      console.log('✅ Top 2 skills identified:', topSkills);
      return topSkills;
    } catch (error) {
      console.error('❌ Error finding top skills:', error);
      return [];
    }
  },

  // Generate 30 deep-dive questions for top 2 skills
  async generateDeepDiveQuestions(topSkills: string[], previousResponses: QuizResponse[]): Promise<AdaptiveQuestion[]> {
    try {
      console.log('🎯 Generating 30 deep-dive questions for top skills:', topSkills);
      
      const prompt = `You are a senior career specialist. Generate exactly 30 advanced assessment questions focused on these 2 top skills: ${topSkills.join(' and ')}.

Create questions that will:
- Deeply evaluate expertise level (15 questions per skill)
- Test advanced scenarios and edge cases
- Assess leadership and mentoring capabilities
- Evaluate market readiness and professional maturity
- Include industry-specific challenges

Mix question types:
- Advanced scenario-based questions (40%)
- Technical depth questions (30%) 
- Leadership/soft skills integration (20%)
- Market awareness questions (10%)

CRITICAL: Every question MUST have the "options" array populated for multiple-choice and scenario questions.

Return ONLY a JSON array with this exact structure:
[{
  "id": "deep_dive_1",
  "question": "advanced question text",
  "type": "multiple-choice",
  "options": ["expert_option1", "expert_option2", "expert_option3", "expert_option4"],
  "skillsAssessed": ["primary_skill"],
  "difficulty": 4,
  "scenario": "professional context"
}]`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('📥 Generated 30 deep-dive questions');
      
      const questions = JSON.parse(text);
      const processedQuestions = questions.map((q: any, index: number) => ({
        id: q.id || `deep_${index + 1}`,
        question: q.question,
        type: q.type || 'multiple-choice', 
        options: q.options && q.options.length > 0 ? q.options : [
          'Strongly agree - I excel at this',
          'Agree - I\'m competent in this area', 
          'Neutral - I have some experience',
          'Disagree - I need development here'
        ],
        skillsAssessed: q.skillsAssessed || [topSkills[Math.floor(index / 15)]],
        difficulty: q.difficulty || 4,
        scenario: q.scenario
      }));
      
      console.log('✅ Processed questions with options:', processedQuestions.length);
      return processedQuestions;
    } catch (error) {
      console.error('❌ Error generating deep-dive questions:', error);
      // Return fallback deep-dive questions
      return this.getFallbackDeepDiveQuestions(topSkills);
    }
  },

  // Generate comprehensive career analysis and recommendations
  async analyzeCareerFit(
    topSkills: string[],
    allResponses: QuizResponse[],
    userProfile: { name: string }
  ): Promise<CareerAnalysis> {
    try {
      console.log('🤖 Generating comprehensive career analysis');
      
      const responseData = allResponses.map(r => ({
        question: r.question,
        answer: r.answer,
        skills: r.skillsAssessed,
        reasoning: r.reasoning
      }));

      const prompt = `You are a senior career strategist and industry analyst. Provide a comprehensive career analysis based on this in-depth assessment.

User: ${userProfile.name}
Top 2 Skills Identified: ${topSkills.join(' & ')}
Total Assessment Responses: ${allResponses.length}
Detailed Response Data: ${JSON.stringify(responseData, null, 2)}

Provide a detailed analysis including:

1. SKILL MASTERY ASSESSMENT (Rate 1-100)
2. CAREER RECOMMENDATIONS with specific job titles, companies, and roles
3. SALARY EXPECTATIONS with current market data
4. INDUSTRY OUTLOOK and growth projections
5. SKILL DEVELOPMENT ROADMAP with timeline
6. PROFESSIONAL NETWORKING suggestions
7. RISK ASSESSMENT and career stability factors

Return ONLY this JSON structure:
{
  "overallScore": 90,
  "topStrengths": ["detailed strength analysis"],
  "skillGaps": ["specific gaps to address"],
  "careerRecommendations": [
    {
      "title": "Senior Software Engineer", 
      "match": 95,
      "description": "Perfect match based on technical skills and problem-solving approach",
      "salaryRange": "$120,000 - $180,000",
      "growthOutlook": "Excellent - 22% growth expected",
      "companies": ["Google", "Microsoft", "startups"],
      "requirements": ["3+ years experience", "portfolio"],
      "pros": ["high demand", "remote options"],
      "cons": ["competitive", "continuous learning required"]
    }
  ],
  "developmentPlan": {
    "immediate": ["specific actions for next 30 days"],
    "shortTerm": ["3-6 month goals with metrics"],
    "longTerm": ["1-2 year career objectives"]
  },
  "marketInsights": {
    "demandLevel": "Very High",
    "competitionLevel": "High", 
    "trendingSkills": ["emerging skills to learn"],
    "industryTrends": ["market movements"],
    "salaryTrends": "15% increase year-over-year"
  },
  "recommendation": "Strong recommendation to pursue this career path",
  "confidence": 94,
  "nextSteps": ["immediate action items"]
}`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());
      
      console.log('✅ Comprehensive career analysis generated');
      
      return {
        overallScore: analysis.overallScore || 85,
        topStrengths: analysis.topStrengths || topSkills,
        skillGaps: analysis.skillGaps || ['Industry Knowledge', 'Networking'],
        careerRecommendations: analysis.careerRecommendations || [],
        developmentPlan: analysis.developmentPlan || {
          immediate: ['Update resume', 'Build portfolio'],
          shortTerm: ['Apply to positions', 'Expand network'],
          longTerm: ['Advance to leadership', 'Specialize further']
        },
        marketInsights: analysis.marketInsights || {
          demandLevel: 'High',
          competitionLevel: 'Moderate',
          trendingSkills: topSkills
        },
        skillPatterns: analysis.topStrengths || topSkills,
        learningPath: [],
        personalityProfile: []
      };
    } catch (error) {
      console.error('❌ Error in career analysis:', error);
      throw error;
    }
  },

  async generateWorkplaceScenario(
    fieldOfInterest: string,
    userProfile: { name: string; previousResponses?: any[] },
    previousScenarios: string[] = []
  ): Promise<any> {
    try {
      console.log('🎭 Generating workplace scenario for:', fieldOfInterest);
      
      const prompt = `You are a senior career coach specializing in ${fieldOfInterest}. Create a realistic workplace scenario that will reveal key skills and personality traits.

Field: ${fieldOfInterest}
User: ${userProfile.name}
Previous scenarios to avoid: ${previousScenarios.join('; ')}

Create a professional scenario that:
1. Tests decision-making skills
2. Reveals leadership potential
3. Shows problem-solving approach
4. Demonstrates industry knowledge
5. Assesses communication style

Return ONLY this JSON structure:
{
  "scenario": "Brief scenario title",
  "context": "Detailed background situation (2-3 sentences)",
  "challenge": "The specific problem or decision needed (1-2 sentences)",
  "options": [
    {
      "id": "option_1",
      "text": "First response option (detailed approach)",
      "skills": ["skill1", "skill2", "skill3"],
      "personality": ["trait1", "trait2"]
    },
    {
      "id": "option_2", 
      "text": "Second response option",
      "skills": ["skill1", "skill2"],
      "personality": ["trait1", "trait2"]
    },
    {
      "id": "option_3",
      "text": "Third response option", 
      "skills": ["skill1", "skill2"],
      "personality": ["trait1", "trait2"]
    },
    {
      "id": "option_4",
      "text": "Fourth response option",
      "skills": ["skill1", "skill2"], 
      "personality": ["trait1", "trait2"]
    }
  ],
  "followUpQuestions": ["reflection question 1", "reflection question 2"]
}`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const scenario = JSON.parse(response.text());
      
      console.log('✅ Workplace scenario generated');
      return scenario;
    } catch (error) {
      console.error('❌ Error generating workplace scenario:', error);
      throw error;
    }
  },

  async analyzeScenarioResponses(
    fieldOfInterest: string,
    responses: any[]
  ): Promise<any> {
    try {
      console.log('📊 Analyzing scenario responses for:', fieldOfInterest);
      
      const responseData = responses.map(r => ({
        scenario: r.scenario,
        choice: r.selectedOption,
        reasoning: r.reasoning
      }));

      const prompt = `Analyze these workplace scenario responses to provide comprehensive career insights for ${fieldOfInterest}.

Scenario Responses: ${JSON.stringify(responseData, null, 2)}

Provide detailed analysis including:
1. Leadership style assessment
2. Problem-solving approach
3. Communication preferences  
4. Decision-making patterns
5. Career fit for ${fieldOfInterest}
6. Salary expectations and market outlook
7. Specific recommendations and next steps

Return ONLY this JSON structure:
{
  "overallScore": 85,
  "leadershipStyle": "Collaborative Leader",
  "problemSolvingApproach": "Analytical and methodical",
  "communicationStyle": "Direct but diplomatic",
  "decisionMakingPattern": "Data-driven with stakeholder input",
  "careerFit": {
    "match": 90,
    "reasoning": "Strong alignment with field requirements",
    "salaryRange": "$75,000 - $120,000",
    "growthOutlook": "Excellent prospects"
  },
  "recommendedRoles": [
    {
      "title": "Senior Project Manager",
      "match": 95,
      "description": "Perfect fit based on leadership and communication skills"
    }
  ],
  "developmentAreas": ["specific skill to improve"],
  "nextSteps": ["immediate action items"],
  "marketInsights": {
    "demandLevel": "High",
    "competitionLevel": "Moderate"
  }
}`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = JSON.parse(response.text());
      
      console.log('✅ Scenario analysis complete');
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing scenario responses:', error);
      throw error;
    }
  },

  async testGeminiAPI(): Promise<{ success: boolean; error?: string; questionsCount?: number }> {
    try {
      console.log('🧪 Testing Gemini API connection...');
      
      const testPrompt = `Generate 3 simple career assessment questions. Return ONLY this JSON:
{
  "questions": [
    {
      "id": "test_1",
      "question": "What motivates you most at work?",
      "type": "multiple-choice",
      "options": ["Achievement", "Collaboration", "Learning", "Impact"]
    },
    {
      "id": "test_2", 
      "question": "How do you prefer to solve problems?",
      "type": "multiple-choice",
      "options": ["Research first", "Brainstorm ideas", "Try solutions", "Ask others"]
    },
    {
      "id": "test_3",
      "question": "What work environment suits you best?",
      "type": "multiple-choice", 
      "options": ["Quiet space", "Team setting", "Flexible location", "Structured office"]
    }
  ]
}`;

      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(testPrompt);
      const response = await result.response;
      const data = JSON.parse(response.text());
      
      console.log('✅ Gemini API test successful');
      return {
        success: true,
        questionsCount: data.questions?.length || 0
      };
    } catch (error) {
      console.error('❌ Gemini API test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Test API connectivity on initialization
console.log('🚀 Gemini Service initialized with API key:', API_KEY.substring(0, 10) + '...');

// Simple test function to verify API connectivity
export const testGeminiAPI = async () => {
  console.log('🧪 Testing Gemini API connectivity...');
  try {
    const testQuestions = await geminiService.generateAdaptiveQuestions(
      ['communication', 'leadership'], 
      [], 
      'initial'
    );
    console.log('✅ Gemini API test successful!');
    console.log('Sample questions generated:', testQuestions.length);
    return { success: true, questionsCount: testQuestions.length };
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    return { success: false, error: error.message };
  }
};
