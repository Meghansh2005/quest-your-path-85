import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestCard } from "@/components/QuestCard";
import { ProgressBar } from "@/components/ProgressBar";
import { AdaptiveQuiz, QuizResponse } from "@/components/AdaptiveQuiz";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { geminiService, CareerAnalysis } from "@/services/geminiService";
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

type Phase = "skill-selection" | "quiz-phase-1" | "quiz-phase-2" | "results";

export const TalentsPath = ({ userName, onBack }: TalentsPathProps) => {
  const [phase, setPhase] = useState<Phase>("skill-selection");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [phase1Responses, setPhase1Responses] = useState<QuizResponse[]>([]);
  const [phase2Responses, setPhase2Responses] = useState<QuizResponse[]>([]);
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

  const handlePhase1Complete = (responses: QuizResponse[]) => {
    setPhase1Responses(responses);
    setPhase("quiz-phase-2");
  };

  const handlePhase2Complete = async (responses: QuizResponse[]) => {
    setPhase2Responses(responses);
    setIsAnalyzing(true);

    try {
      const allResponses = [...phase1Responses, ...responses];
      const analysis = await geminiService.analyzeCareerFit(
        selectedSkills,
        allResponses,
        { name: userName }
      );
      setCareerAnalysis(analysis);
      setPhase("results");
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze your responses. Please try again.",
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
    setCareerAnalysis(null);
  };

  const getProgress = () => {
    switch (phase) {
      case "skill-selection": return 15;
      case "quiz-phase-1": return 15 + (phase1Responses.length / 20) * 35;
      case "quiz-phase-2": return 50 + (phase2Responses.length / 30) * 40;
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

      <div className="text-center">
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

  const renderAnalyzing = () => (
    <div className="max-w-2xl mx-auto text-center">
      <QuestCard className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
          <h2 className="text-2xl font-bold">🤖 AI is Analyzing Your Responses</h2>
          <p className="text-muted-foreground">
            Our advanced AI is processing your answers to generate personalized career insights...
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm mt-6">
            <div className="bg-primary/10 p-3 rounded">
              ✓ Skill Pattern Analysis
            </div>
            <div className="bg-secondary/10 p-3 rounded">
              ✓ Career Matching
            </div>
            <div className="bg-accent/10 p-3 rounded">
              ✓ Market Intelligence
            </div>
            <div className="bg-warning/10 p-3 rounded">
              ✓ Learning Path Generation
            </div>
          </div>
        </div>
      </QuestCard>
    </div>
  );

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
            <AdaptiveQuiz
              selectedSkills={selectedSkills}
              onComplete={handlePhase1Complete}
              phase="initial"
              totalQuestions={20}
            />
          )}
          
          {phase === "quiz-phase-2" && (
            <AdaptiveQuiz
              selectedSkills={selectedSkills}
              onComplete={handlePhase2Complete}
              phase="deep-dive"
              totalQuestions={30}
            />
          )}
          
          {isAnalyzing && renderAnalyzing()}
          
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