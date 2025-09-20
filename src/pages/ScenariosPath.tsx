import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ProgressBar";
import { ScenarioQuiz } from "@/components/ScenarioQuiz";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { geminiService, CareerAnalysis, PersonalityTrait, SkillGap, LearningPathItem, CareerRecommendation } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

interface ScenariosPathProps {
  userName: string;
  onBack: () => void;
}

// Define ScenarioResults interface
interface ScenarioResults {
  personalityProfile?: PersonalityTrait[];
  workStylePreferences?: string[];
  leadershipStyle?: string;
  problemSolvingApproach?: string;
  careerRecommendations?: CareerRecommendation[];
  developmentAreas?: string[];
  skillGaps?: SkillGap[];
  learningPath?: LearningPathItem[];
  overallScore?: number;
  topStrengths?: string[];
  developmentPlan?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  marketInsights?: {
    demandLevel: string;
    competitionLevel: string;
    trendingSkills: string[];
  };
  skillPatterns?: string[];
}

type Phase = "field-selection" | "scenario-quiz" | "results";

const FIELDS = [
  { 
    id: "technology", 
    name: "Technology", 
    icon: "💻", 
    description: "Software, IT, engineering, and tech innovation",
    marketDemand: "Very High",
    avgSalary: "$85,000 - $130,000",
    growthRate: "18% annually",
    idealFor: ["Problem solvers", "Logical thinkers", "Innovation enthusiasts", "Continuous learners"],
    commonRoles: ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"],
    keySkills: ["Programming", "System Design", "Data Analysis", "Technical Leadership"]
  },
  { 
    id: "business", 
    name: "Business", 
    icon: "💼", 
    description: "Management, consulting, operations, and strategy",
    marketDemand: "High",
    avgSalary: "$75,000 - $120,000",
    growthRate: "12% annually",
    idealFor: ["Strategic thinkers", "People leaders", "Goal-oriented individuals", "Communication experts"],
    commonRoles: ["Business Analyst", "Operations Manager", "Strategy Consultant", "Project Manager"],
    keySkills: ["Strategic Planning", "Leadership", "Financial Analysis", "Stakeholder Management"]
  },
  { 
    id: "healthcare", 
    name: "Healthcare", 
    icon: "🏥", 
    description: "Medical, nursing, healthcare administration",
    marketDemand: "Very High",
    avgSalary: "$70,000 - $110,000",
    growthRate: "15% annually",
    idealFor: ["Compassionate caregivers", "Detail-oriented individuals", "Team collaborators", "Lifelong learners"],
    commonRoles: ["Healthcare Administrator", "Clinical Manager", "Health Informatics", "Quality Coordinator"],
    keySkills: ["Patient Care", "Regulatory Compliance", "Healthcare Operations", "Quality Management"]
  },
  { 
    id: "education", 
    name: "Education", 
    icon: "🎓", 
    description: "Teaching, training, educational leadership",
    marketDemand: "Moderate",
    avgSalary: "$50,000 - $85,000",
    growthRate: "8% annually",
    idealFor: ["Natural teachers", "Patient mentors", "Curriculum developers", "Community builders"],
    commonRoles: ["Educational Administrator", "Training Manager", "Curriculum Developer", "Academic Coordinator"],
    keySkills: ["Teaching", "Curriculum Design", "Educational Technology", "Student Assessment"]
  },
  { 
    id: "creative", 
    name: "Creative", 
    icon: "🎨", 
    description: "Design, marketing, content creation",
    marketDemand: "High",
    avgSalary: "$60,000 - $95,000",
    growthRate: "10% annually",
    idealFor: ["Visual thinkers", "Brand storytellers", "Trend followers", "Artistic innovators"],
    commonRoles: ["UX Designer", "Marketing Manager", "Content Strategist", "Brand Manager"],
    keySkills: ["Design Thinking", "Brand Strategy", "Content Creation", "Digital Marketing"]
  },
  { 
    id: "finance", 
    name: "Finance", 
    icon: "💰", 
    description: "Banking, investment, financial planning",
    marketDemand: "High",
    avgSalary: "$80,000 - $125,000",
    growthRate: "11% annually",
    idealFor: ["Analytical minds", "Risk assessors", "Detail-oriented planners", "Numbers enthusiasts"],
    commonRoles: ["Financial Analyst", "Investment Advisor", "Risk Manager", "Financial Planner"],
    keySkills: ["Financial Analysis", "Risk Management", "Investment Strategy", "Regulatory Knowledge"]
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "⚙️",
    description: "Mechanical, civil, electrical, and systems engineering",
    marketDemand: "Very High",
    avgSalary: "$80,000 - $135,000",
    growthRate: "16% annually",
    idealFor: ["Technical problem solvers", "Precision-focused individuals", "Systems thinkers", "Innovation drivers"],
    commonRoles: ["Project Engineer", "Systems Engineer", "Engineering Manager", "Technical Consultant"],
    keySkills: ["Technical Design", "Project Management", "Quality Assurance", "Systems Integration"]
  },
  {
    id: "sales",
    name: "Sales & Business Development",
    icon: "📈",
    description: "Sales, account management, business development",
    marketDemand: "High",
    avgSalary: "$65,000 - $150,000",
    growthRate: "14% annually",
    idealFor: ["Relationship builders", "Persuasive communicators", "Goal-driven achievers", "Competitive spirits"],
    commonRoles: ["Sales Manager", "Account Executive", "Business Development Manager", "Sales Director"],
    keySkills: ["Relationship Building", "Negotiation", "Market Analysis", "Revenue Generation"]
  },
  {
    id: "operations",
    name: "Operations & Supply Chain",
    icon: "🔗",
    description: "Operations management, logistics, supply chain optimization",
    marketDemand: "High",
    avgSalary: "$70,000 - $115,000",
    growthRate: "13% annually",
    idealFor: ["Process optimizers", "Detail-oriented planners", "Efficiency experts", "Coordination specialists"],
    commonRoles: ["Operations Manager", "Supply Chain Analyst", "Logistics Coordinator", "Process Improvement Manager"],
    keySkills: ["Process Optimization", "Logistics Management", "Data Analysis", "Vendor Management"]
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: "👥",
    description: "HR management, talent acquisition, organizational development",
    marketDemand: "Moderate",
    avgSalary: "$65,000 - $105,000",
    growthRate: "9% annually",
    idealFor: ["People advocates", "Empathetic communicators", "Policy implementers", "Culture builders"],
    commonRoles: ["HR Manager", "Talent Acquisition Specialist", "Organizational Development Consultant", "Compensation Analyst"],
    keySkills: ["Employee Relations", "Talent Management", "Policy Development", "Performance Management"]
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    icon: "⚖️",
    description: "Legal services, compliance, risk management",
    marketDemand: "Moderate",
    avgSalary: "$85,000 - $160,000",
    growthRate: "7% annually",
    idealFor: ["Detail-oriented analysts", "Ethical advocates", "Critical thinkers", "Research specialists"],
    commonRoles: ["Legal Counsel", "Compliance Officer", "Contract Manager", "Legal Operations Manager"],
    keySkills: ["Legal Research", "Regulatory Compliance", "Contract Negotiation", "Risk Assessment"]
  },
  {
    id: "consulting",
    name: "Management Consulting",
    icon: "🎯",
    description: "Strategic consulting, change management, business transformation",
    marketDemand: "High",
    avgSalary: "$90,000 - $180,000",
    growthRate: "15% annually",
    idealFor: ["Strategic thinkers", "Problem solvers", "Change agents", "Client-focused professionals"],
    commonRoles: ["Management Consultant", "Strategy Advisor", "Change Management Specialist", "Business Transformation Lead"],
    keySkills: ["Strategic Analysis", "Change Management", "Client Relations", "Business Process Design"]
  },
  {
    id: "data",
    name: "Data & Analytics",
    icon: "📊",
    description: "Data science, business intelligence, analytics",
    marketDemand: "Very High",
    avgSalary: "$85,000 - $140,000",
    growthRate: "22% annually",
    idealFor: ["Analytical thinkers", "Pattern recognizers", "Statistical minds", "Story tellers with data"],
    commonRoles: ["Data Scientist", "Business Intelligence Analyst", "Data Engineer", "Analytics Manager"],
    keySkills: ["Statistical Analysis", "Data Visualization", "Machine Learning", "Business Intelligence"]
  }
];

export const ScenariosPath = ({ userName, onBack }: ScenariosPathProps) => {
  const [phase, setPhase] = useState<Phase>("field-selection");
  const [fieldOfInterest, setFieldOfInterest] = useState<string>("");
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFieldSelect = (fieldId: string) => {
    setFieldOfInterest(fieldId);
    setPhase("scenario-quiz");
  };

  const handleScenarioComplete = async (scenarioResults: ScenarioResults) => {
    console.log('🎯 Scenario analysis complete:', scenarioResults);
    setIsAnalyzing(true);
    
    try {
      // Use Gemini to analyze scenario responses for personality traits
      const personalityAnalysis = await geminiService.analyzeScenarioResponsesForPersonality(
        fieldOfInterest,
        scenarioResults
      );
      
      // Merge Gemini analysis with scenario results
      const enhancedResults = {
        ...scenarioResults,
        personalityProfile: personalityAnalysis.personalityProfile || scenarioResults.personalityProfile
      };
      
      // Convert scenario results to career analysis format
      const analysis = convertToCareerAnalysis(enhancedResults);
      setCareerAnalysis(analysis);
      setPhase("results");
      
      toast({
        title: "Analysis Complete! 🎉",
        description: "Your personalized career report is ready."
      });
    } catch (error) {
      console.error('Error processing scenario results:', error);
      
      // Fallback to static analysis if Gemini fails
      const analysis = convertToCareerAnalysis(scenarioResults);
      setCareerAnalysis(analysis);
      setPhase("results");
      
      toast({
        title: "Analysis Complete",
        description: "Your career report is ready with fallback analysis.",
        variant: "default"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setPhase("field-selection");
    setFieldOfInterest("");
    setCareerAnalysis(null);
  };

  // Convert ScenarioResults to CareerAnalysis format
  const convertToCareerAnalysis = (scenarioResults: ScenarioResults): CareerAnalysis => {
    // Generate comprehensive skill gaps based on analysis
    const generateSkillGaps = (): SkillGap[] => {
      const fieldSkills: Record<string, SkillGap[]> = {
        'technology': [
          { skill: 'Advanced Technical Architecture', currentLevel: 6, requiredLevel: 9, priority: 'high', developmentTime: '6-9 months' },
          { skill: 'Strategic Technology Planning', currentLevel: 5, requiredLevel: 8, priority: 'medium', developmentTime: '8-12 months' },
          { skill: 'Team Leadership & Mentoring', currentLevel: 7, requiredLevel: 9, priority: 'medium', developmentTime: '4-6 months' }
        ],
        'business': [
          { skill: 'Strategic Business Analysis', currentLevel: 6, requiredLevel: 9, priority: 'high', developmentTime: '5-8 months' },
          { skill: 'Executive Communication', currentLevel: 7, requiredLevel: 9, priority: 'high', developmentTime: '3-6 months' },
          { skill: 'Financial Management', currentLevel: 4, requiredLevel: 7, priority: 'medium', developmentTime: '9-12 months' }
        ],
        'healthcare': [
          { skill: 'Healthcare Operations Management', currentLevel: 6, requiredLevel: 8, priority: 'high', developmentTime: '6-9 months' },
          { skill: 'Regulatory Compliance', currentLevel: 5, requiredLevel: 8, priority: 'medium', developmentTime: '8-12 months' },
          { skill: 'Quality Improvement Systems', currentLevel: 6, requiredLevel: 9, priority: 'medium', developmentTime: '6-10 months' }
        ]
      };
      
      return fieldSkills[fieldOfInterest] || [
        { skill: 'Advanced Leadership Skills', currentLevel: 6, requiredLevel: 9, priority: 'high', developmentTime: '4-6 months' },
        { skill: 'Strategic Planning', currentLevel: 5, requiredLevel: 8, priority: 'medium', developmentTime: '6-9 months' },
        { skill: 'Industry Technology Trends', currentLevel: 4, requiredLevel: 7, priority: 'medium', developmentTime: '8-12 months' }
      ];
    };

    // Generate comprehensive personality profile
    const generatePersonalityProfile = (): PersonalityTrait[] => {
      if (scenarioResults.personalityProfile && scenarioResults.personalityProfile.length > 0) {
        return scenarioResults.personalityProfile;
      }
      
      return [
        {
          trait: 'Leadership Approach',
          score: 8,
          description: `Demonstrates ${scenarioResults.leadershipStyle || 'collaborative'} leadership style with strong team focus and strategic thinking capabilities. Shows natural ability to balance multiple priorities while maintaining team morale.`,
          careerImplications: ['Senior management roles', 'Team leadership positions', 'Cross-functional coordination', 'Strategic planning roles'],
          workplaceExamples: ['Facilitates effective team meetings', 'Builds consensus among stakeholders', 'Mentors team members', 'Drives strategic initiatives']
        },
        {
          trait: 'Problem-Solving Style',
          score: 9,
          description: `Exhibits ${scenarioResults.problemSolvingApproach || 'systematic and analytical'} approach to complex challenges. Demonstrates strong ability to break down problems and consider multiple perspectives before making decisions.`,
          careerImplications: ['Business analysis', 'Strategic consulting', 'Process optimization', 'Research and development'],
          workplaceExamples: ['Thoroughly analyzes complex situations', 'Considers stakeholder perspectives', 'Develops comprehensive solutions', 'Implements effective strategies']
        },
        {
          trait: 'Communication Excellence',
          score: 8,
          description: 'Strong communication and interpersonal skills with ability to adapt message to different audiences. Demonstrates active listening and relationship-building capabilities.',
          careerImplications: ['Client relations', 'Public speaking roles', 'Training and development', 'Executive communication'],
          workplaceExamples: ['Presents complex ideas clearly', 'Builds rapport with stakeholders', 'Mediates conflicts effectively', 'Facilitates productive discussions']
        },
        {
          trait: 'Adaptability & Innovation',
          score: 7,
          description: 'Shows good flexibility in changing situations while maintaining focus on objectives. Balances innovative thinking with practical implementation considerations.',
          careerImplications: ['Change management', 'Innovation teams', 'Startup environments', 'Digital transformation roles'],
          workplaceExamples: ['Adjusts strategies based on new information', 'Embraces change initiatives', 'Proposes creative solutions', 'Tests new approaches carefully']
        },
        {
          trait: 'Decision-Making Style',
          score: 8,
          description: 'Demonstrates data-driven decision-making with strong consideration for team input and stakeholder impact. Shows good judgment under pressure.',
          careerImplications: ['Executive roles', 'Risk management', 'Strategic planning', 'Operations management'],
          workplaceExamples: ['Makes informed decisions quickly', 'Involves team in decision process', 'Considers long-term implications', 'Takes accountability for outcomes']
        }
      ];
    };

    // Generate enhanced career recommendations
    const generateCareerRecommendations = (): CareerRecommendation[] => {
      const baseRecommendations = scenarioResults.careerRecommendations || [];
      const fieldName = FIELDS.find(f => f.id === fieldOfInterest)?.name || fieldOfInterest;
      
      if (baseRecommendations.length === 0) {
        return [
          {
            title: `Senior ${fieldName} Manager`,
            match: 92,
            description: `Lead ${fieldName} teams and strategic initiatives with your demonstrated ${scenarioResults.leadershipStyle || 'collaborative'} leadership style and ${scenarioResults.problemSolvingApproach || 'analytical'} problem-solving approach.`,
            salaryRange: '$85,000 - $125,000',
            growthOutlook: 'Excellent - 15% annual growth expected',
            field: fieldName,
            matchScore: 92,
            growthProspects: 'Strong demand for experienced managers',
            requiredSkills: ['Advanced leadership', 'Strategic planning', 'Team management', 'Industry expertise'],
            timeToTransition: '6-12 months with targeted skill development'
          },
          {
            title: `${fieldName} Strategy Consultant`,
            match: 89,
            description: `Leverage your analytical skills and strategic thinking to help organizations solve complex ${fieldName} challenges.`,
            salaryRange: '$90,000 - $140,000',
            growthOutlook: 'Strong growth in specialized consulting',
            field: fieldName,
            matchScore: 89,
            growthProspects: 'High demand for strategic expertise',
            requiredSkills: ['Strategic analysis', 'Client management', 'Presentation skills', 'Industry knowledge'],
            timeToTransition: '9-15 months including consulting skills'
          },
          {
            title: `${fieldName} Operations Director`,
            match: 85,
            description: `Apply your systematic approach and leadership skills to optimize operations and drive organizational efficiency.`,
            salaryRange: '$95,000 - $135,000',
            growthOutlook: 'Steady demand across industries',
            field: fieldName,
            matchScore: 85,
            growthProspects: 'Consistent opportunities in growing companies',
            requiredSkills: ['Operations management', 'Process optimization', 'Data analysis', 'Change management'],
            timeToTransition: '8-14 months with operations training'
          }
        ];
      }
      
      // Transform existing recommendations to match interface
      return baseRecommendations.map((career, index) => ({
        title: career.title,
        match: career.match || career.matchScore || (90 - index * 3),
        description: career.description || `Career path in ${fieldName} matching your demonstrated skills and approach`,
        salaryRange: career.salaryRange || '$75,000 - $110,000',
        growthOutlook: career.growthOutlook || career.growthProspects || 'Good growth prospects',
        field: career.field || fieldName,
        matchScore: career.matchScore || career.match || (90 - index * 3),
        growthProspects: career.growthProspects || career.growthOutlook || 'Positive outlook',
        requiredSkills: career.requiredSkills || ['Leadership', 'Communication', 'Strategic thinking'],
        timeToTransition: career.timeToTransition || '6-12 months'
      }));
    };

    const fieldName = FIELDS.find(f => f.id === fieldOfInterest)?.name || fieldOfInterest;

    return {
      overallScore: scenarioResults.overallScore || 88,
      topStrengths: scenarioResults.topStrengths || [
        `${scenarioResults.problemSolvingApproach || 'Analytical'} problem-solving approach`,
        `${scenarioResults.leadershipStyle || 'Collaborative'} leadership style`,
        'Strong strategic thinking capabilities',
        'Excellent communication and relationship building',
        'Adaptability and resilience under pressure'
      ],
      skillGaps: scenarioResults.skillGaps || generateSkillGaps(),
      careerRecommendations: generateCareerRecommendations(),
      developmentPlan: scenarioResults.developmentPlan || {
        immediate: [
          'Complete comprehensive skills assessment',
          `Join professional ${fieldName} associations`,
          'Update LinkedIn profile and professional brand',
          'Network with industry leaders and mentors'
        ],
        shortTerm: [
          'Pursue advanced certification in core competencies',
          'Seek stretch assignments requiring strategic thinking',
          'Build expertise in emerging industry trends',
          'Develop executive presentation skills'
        ],
        longTerm: [
          'Target senior management opportunities',
          'Consider consulting or advisory roles',
          'Develop thought leadership through speaking/writing',
          'Mentor next generation of professionals'
        ]
      },
      detailedRoadmap: {
        immediate: [
          {
            title: 'Skills Assessment & Gap Analysis',
            description: 'Complete comprehensive evaluation of current capabilities against industry standards',
            timeline: '2-3 weeks',
            priority: 'Critical'
          },
          {
            title: 'Professional Network Expansion',
            description: 'Connect with 20+ industry professionals and join relevant associations',
            timeline: '4-6 weeks',
            priority: 'High'
          }
        ],
        shortTerm: [
          {
            title: 'Advanced Certification Program',
            description: 'Complete industry-recognized certification in core competency area',
            timeline: '4-6 months',
            priority: 'High'
          },
          {
            title: 'Strategic Project Leadership',
            description: 'Lead high-visibility project demonstrating strategic capabilities',
            timeline: '6-9 months',
            priority: 'Medium'
          }
        ],
        longTerm: [
          {
            title: 'Senior Leadership Transition',
            description: 'Secure senior management role with expanded responsibilities',
            timeline: '12-18 months',
            priority: 'High'
          },
          {
            title: 'Industry Thought Leadership',
            description: 'Establish expertise through speaking, writing, and mentoring',
            timeline: '18-24 months',
            priority: 'Medium'
          }
        ]
      },
      marketInsights: scenarioResults.marketInsights || {
        demandLevel: 'High',
        competitionLevel: 'Moderate',
        trendingSkills: [
          'Digital transformation leadership',
          'Remote team management',
          'Data-driven decision making',
          'Cross-functional collaboration',
          'Change management',
          'Strategic communication'
        ]
      },
      skillPatterns: scenarioResults.skillPatterns || [
        `${scenarioResults.problemSolvingApproach || 'Analytical'} problem solver`,
        `${scenarioResults.leadershipStyle || 'Collaborative'} leader`,
        'Strategic thinker with practical implementation focus',
        'Strong communicator and relationship builder'
      ],
      learningPath: scenarioResults.learningPath || [
        {
          skill: 'Advanced Leadership Development',
          action: 'Develop Advanced Leadership Development through targeted professional development',
          resources: [
            'Professional certification programs',
            'Executive education courses',
            'Industry conferences and workshops',
            'Mentorship and coaching programs',
            'Online learning platforms'
          ],
          timeline: '4-6 months',
          measurableOutcome: 'Achieve professional competency in Advanced Leadership Development with measurable improvements in performance metrics',
          difficultyLevel: 'Intermediate',
          prerequisites: 'Current professional experience'
        }
      ],
      personalityProfile: generatePersonalityProfile(),
      skillDetails: [] // This would be populated by the skill details service if available
    };
  };

  const getPhaseProgress = () => {
    switch (phase) {
      case "field-selection": return 20;
      case "scenario-quiz": return 60;
      case "results": return 100;
      default: return 0;
    }
  };

  const renderFieldSelection = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold mb-4">
          🎯 Choose Your Field of Interest
        </h2>
        <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
          Select the field you're most interested in exploring. We'll create realistic workplace scenarios to assess your decision-making style and career fit. Each field offers unique career paths and growth opportunities.
        </p>
      </div>

      {/* Recommendations Section */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10">
        <h3 className="text-xl font-semibold mb-4 text-center">
          💡 How to Choose the Right Field
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="text-center space-y-2">
            <div className="text-2xl">🧠</div>
            <h4 className="font-semibold">Consider Your Strengths</h4>
            <p className="text-muted-foreground">Think about what energizes you and where you excel naturally</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl">📈</div>
            <h4 className="font-semibold">Review Market Demand</h4>
            <p className="text-muted-foreground">Look at growth rates and salary ranges for each field</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl">🎯</div>
            <h4 className="font-semibold">Match Your Goals</h4>
            <p className="text-muted-foreground">Choose based on your career aspirations and lifestyle preferences</p>
          </div>
        </div>
      </div>

      {/* Field Selection Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FIELDS.map((field) => (
          <Card
            key={field.id}
            className="p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50 bg-gradient-to-br from-background to-background/80"
            onClick={() => handleFieldSelect(field.id)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="text-4xl mb-2">{field.icon}</div>
                <h3 className="text-xl font-bold">{field.name}</h3>
                <p className="text-sm text-muted-foreground">{field.description}</p>
              </div>

              {/* Market Info */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Market Demand:</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    field.marketDemand === 'Very High' ? 'bg-green-100 text-green-700' :
                    field.marketDemand === 'High' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {field.marketDemand}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Avg Salary:</span>
                  <span className="text-xs font-semibold">{field.avgSalary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">Growth Rate:</span>
                  <span className="text-xs font-semibold text-green-600">{field.growthRate}</span>
                </div>
              </div>

              {/* Ideal For */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Ideal for:</h4>
                <div className="flex flex-wrap gap-1">
                  {field.idealFor.slice(0, 2).map((trait, index) => (
                    <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {trait}
                    </span>
                  ))}
                  {field.idealFor.length > 2 && (
                    <span className="text-xs text-muted-foreground">+{field.idealFor.length - 2} more</span>
                  )}
                </div>
              </div>

              {/* Common Roles */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Common Roles:</h4>
                <div className="text-xs text-muted-foreground">
                  {field.commonRoles.slice(0, 2).join(', ')}
                  {field.commonRoles.length > 2 && ` +${field.commonRoles.length - 2} more`}
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                Explore {field.name} Scenarios →
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Help Section */}
      <div className="text-center space-y-4 border-t pt-8">
        <h3 className="text-lg font-semibold">Still Unsure? 🤔</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Don't worry! Our scenario-based assessment will reveal insights about your professional style regardless of which field you choose. 
          Pick the one that feels most interesting to you right now.
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>🕰️</span>
            <span>5-7 scenarios</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>10-15 minutes</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span>Detailed analysis</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScenarioPhase = () => (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          🏢 Real-World Scenarios
        </h2>
        <p className="text-lg text-muted-foreground">
          Navigate workplace challenges in {FIELDS.find(f => f.id === fieldOfInterest)?.name} to reveal your professional style
        </p>
      </div>
      
      <ScenarioQuiz
        fieldOfInterest={fieldOfInterest}
        userName={userName}
        onComplete={handleScenarioComplete}
      />
    </div>
  );

  const renderResults = () => (
    careerAnalysis && (
      <ResultsDisplay
        analysis={careerAnalysis}
        userName={userName}
        onRestart={handleRestart}
      />
    )
  );

  const renderAnalyzing = () => (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <h2 className="text-2xl font-bold">🧠 Analyzing Your Responses</h2>
      <p className="text-muted-foreground">
        Our AI is processing your scenario responses to create your personalized career analysis...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 px-6 py-3 rounded-xl backdrop-blur-sm"
            >
              ← Back to Paths
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {userName}'s Scenario Analysis
              </h1>
            </div>
            
            <div className="w-32"></div>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Phase: {phase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <ProgressBar 
              progress={getPhaseProgress()}
              showPercentage={true}
            />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>🎭 Discover your career path through realistic workplace scenarios</p>
            </div>
          </div>
        </div>

        {/* Phase Content */}
        <div className="space-y-8">
          {isAnalyzing && renderAnalyzing()}
          {!isAnalyzing && phase === "field-selection" && renderFieldSelection()}
          {!isAnalyzing && phase === "scenario-quiz" && renderScenarioPhase()}
          {!isAnalyzing && phase === "results" && renderResults()}
        </div>
      </div>
    </div>
  );
};