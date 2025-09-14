import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestCard } from "@/components/QuestCard";
import { ProgressBar } from "@/components/ProgressBar";

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
  const [currentQuestion, setCurrentQuestion] = useState(0);

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

  const getProgress = () => {
    switch (phase) {
      case "skill-selection": return 20;
      case "quiz-phase-1": return 40 + (currentQuestion / 20) * 30;
      case "quiz-phase-2": return 70 + (currentQuestion / 30) * 25;
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

  const renderQuizPlaceholder = () => (
    <div className="max-w-2xl mx-auto text-center">
      <QuestCard className="p-8">
        <h2 className="text-2xl font-bold mb-4">Assessment Coming Soon!</h2>
        <p className="text-muted-foreground mb-6">
          The personalized quiz based on your selected skills will be implemented next.
          This will include {phase === "quiz-phase-1" ? "20" : "30"} carefully crafted questions
          to understand your preferences and working style.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-primary/10 p-3 rounded">
            Phase 1: Core Assessment (20 questions)
          </div>
          <div className="bg-secondary/10 p-3 rounded">
            Phase 2: Deep Dive (30 questions)
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
          {(phase === "quiz-phase-1" || phase === "quiz-phase-2") && renderQuizPlaceholder()}
        </div>
      </div>
    </div>
  );
};