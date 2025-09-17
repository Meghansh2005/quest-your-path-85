import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestCard } from "@/components/QuestCard";
import { ProgressBar } from "@/components/ProgressBar";
import { AdaptiveQuiz, QuizResponse } from "@/components/AdaptiveQuiz";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { geminiService, CareerAnalysis, testGeminiAPI } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

interface TalentsPathProps {
  userName: string;
  onBack: () => void;
}

const SKILLS = [
  { id: "leadership", name: "Leadership", icon: "👥" },
  { id: "communication", name: "Communication", icon: "💬" },
  { id: "problem-solving", name: "Problem Solving", icon: "🧩" },
  { id: "creativity", name: "Creativity", icon: "🎨" },
  { id: "technical", name: "Technical Skills", icon: "⚙️" },
  { id: "analytics", name: "Data Analytics", icon: "📊" },
  { id: "design", name: "Design", icon: "✨" },
  { id: "writing", name: "Writing", icon: "✍️" },
  { id: "marketing", name: "Marketing", icon: "📢" },
  { id: "sales", name: "Sales", icon: "💼" },
  { id: "project-management", name: "Project Management", icon: "📋" },
  { id: "research", name: "Research", icon: "🔍" },
  { id: "teaching", name: "Teaching", icon: "🎓" },
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "strategy", name: "Strategy", icon: "🎯" },
];

type Phase = "skill-selection" | "quiz-phase-1" | "analysis" | "quiz-phase-2" | "final-analysis" | "results";

export const TalentsPath = ({ userName, onBack }: TalentsPathProps) => {
  const [phase, setPhase] = useState<Phase>("skill-selection");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [phase1Responses, setPhase1Responses] = useState<QuizResponse[]>([]);
  const [phase2Responses, setPhase2Responses] = useState<QuizResponse[]>([]);
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [careerAnalysis, setCareerAnalysis] = useState<CareerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else if (prev.length < 5) {
        return [...prev, skillId];
      }
      return prev;
    });
  };

  const handleContinueToQuiz = () => {
    if (selectedSkills.length === 5) {
      setPhase("quiz-phase-1");
    }
  };

  const handlePhase1Complete = async (responses: QuizResponse[]) => {
    setPhase1Responses(responses);
    setIsAnalyzing(true);
    setPhase("analysis");

    try {
      // Find top 2 skills from the 20 responses
      const topTwoSkills = await geminiService.findTopSkills(responses);
      setTopSkills(topTwoSkills);
      
      toast({
        title: "✅ Analysis Complete!",
        description: `Your top skills are: ${topTwoSkills.join(' & ')}`,
      });

      setPhase("quiz-phase-2");
    } catch (error) {
      toast({
        title: "Analysis Error", 
        description: "Failed to analyze your top skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhase2Complete = async (responses: QuizResponse[]) => {
    setPhase2Responses(responses);
    setIsAnalyzing(true);
    setPhase("final-analysis");

    try {
      const allResponses = [...phase1Responses, ...responses];
      const analysis = await geminiService.analyzeCareerFit(
        topSkills,
        allResponses,
        { name: userName }
      );
      setCareerAnalysis(analysis);
      setPhase("results");
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to generate your career report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setPhase("skill-selection");
    setSelectedSkills([]);
    setPhase1Responses([]);
    setPhase2Responses([]);
    setTopSkills([]);
    setCareerAnalysis(null);
  };

  const getProgress = () => {
    switch (phase) {
      case "skill-selection": return 10;
      case "quiz-phase-1": return 10 + (phase1Responses.length / 20) * 30;
      case "analysis": return 40;
      case "quiz-phase-2": return 45 + (phase2Responses.length / 30) * 35;
      case "final-analysis": return 80;
      case "results": return 100;
      default: return 0;
    }
  };

  const renderSkillSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Select Your Top 5 Skills</h2>
        <p className="text-muted-foreground mb-6">
          Choose the abilities that best represent your strengths and interests
        </p>
        <p className="text-sm text-primary">
          Selected: {selectedSkills.length}/5
        </p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {SKILLS.map((skill) => (
          <div
            key={skill.id}
            className={`skill-circle ${selectedSkills.includes(skill.id) ? 'selected' : ''}`}
            onClick={() => handleSkillToggle(skill.id)}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{skill.icon}</div>
              <div className="text-xs font-medium">{skill.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center space-y-4">
        {/* Test API Button - Development Only */}
        <div className="mb-4">
          <Button
            onClick={async () => {
              toast({
                title: "🧪 Testing Gemini API...",
                description: "Please wait while we test the connection.",
              });
              const result = await testGeminiAPI();
              toast({
                title: result.success ? "✅ Gemini API Connected!" : "❌ API Test Failed",
                description: result.success 
                  ? `Generated ${result.questionsCount || 0} sample questions successfully.`
                  : result.error,
                variant: result.success ? "default" : "destructive",
              });
            }}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🧪 Test Gemini API
          </Button>
        </div>
        
        <Button
          onClick={handleContinueToQuiz}
          disabled={selectedSkills.length !== 5}
          size="lg"
          className="gradient-primary hover:shadow-primary transition-all duration-300"
        >
          Continue to Assessment
        </Button>
      </div>
    </div>
  );

  const renderAnalyzing = () => {
    const isInitialAnalysis = phase === "analysis";
    const isFinalAnalysis = phase === "final-analysis";
    
    return (
      <div className="max-w-2xl mx-auto text-center">
        <QuestCard className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
            <h2 className="text-2xl font-bold">
              {isInitialAnalysis ? "🔍 Finding Your Top Skills" : "🤖 Generating Career Analysis"}
            </h2>
            <p className="text-muted-foreground">
              {isInitialAnalysis 
                ? "AI is analyzing your 20 responses to identify your 2 strongest skills..."
                : "Creating your comprehensive career report with salary insights and recommendations..."
              }
            </p>
            
            {isInitialAnalysis ? (
              <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                <div className="bg-primary/10 p-3 rounded">
                  ✓ Response Analysis
                </div>
                <div className="bg-secondary/10 p-3 rounded">
                  ✓ Skill Ranking
                </div>
                <div className="bg-accent/10 p-3 rounded">
                  ✓ Strength Identification
                </div>
                <div className="bg-warning/10 p-3 rounded">
                  ✓ Top 2 Selection
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                <div className="bg-primary/10 p-3 rounded">
                  ✓ Deep Skill Analysis
                </div> 
                <div className="bg-secondary/10 p-3 rounded">
                  ✓ Career Matching
                </div>
                <div className="bg-accent/10 p-3 rounded">
                  ✓ Salary Research
                </div>
                <div className="bg-warning/10 p-3 rounded">
                  ✓ Report Generation
                </div>
              </div>
            )}
          </div>
        </QuestCard>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onBack}>
              ← Back to Paths
            </Button>
            <h1 className="text-2xl font-bold">
              {userName}'s Talent Discovery
            </h1>
            <div className="w-20"></div>
          </div>
          
          <ProgressBar progress={getProgress()} variant="primary" className="mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(getProgress())}% Complete
          </p>
        </div>

        {/* Content */}
        <div className="animate-fade-in-up">
          {phase === "skill-selection" && renderSkillSelection()}
          
          {phase === "quiz-phase-1" && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Phase 1: Skill Assessment</h2>
                <p className="text-muted-foreground">20 questions to identify your strongest skills</p>
              </div>
              <AdaptiveQuiz
                selectedSkills={selectedSkills}
                onComplete={handlePhase1Complete}
                phase="initial"
                totalQuestions={20}
                useGeminiGeneration={true}
              />
            </div>
          )}
          
          {(phase === "analysis" || phase === "final-analysis") && renderAnalyzing()}
          
          {phase === "quiz-phase-2" && topSkills.length > 0 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Phase 2: Deep Dive Assessment</h2>
                <p className="text-muted-foreground">30 advanced questions focused on your top skills:</p>
                <div className="flex justify-center gap-2 mt-2">
                  {topSkills.map((skill, index) => (
                    <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <AdaptiveQuiz
                selectedSkills={topSkills}
                onComplete={handlePhase2Complete}
                phase="deep-dive"
                totalQuestions={30}
                useGeminiGeneration={true}
              />
            </div>
          )}
          
          {phase === "results" && careerAnalysis && (
            <ResultsDisplay
              analysis={careerAnalysis}
              userName={userName}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
};