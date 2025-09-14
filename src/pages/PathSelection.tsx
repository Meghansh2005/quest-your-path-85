import { QuestCard } from "@/components/QuestCard";
import { Button } from "@/components/ui/button";
import talentsImage from "@/assets/talents-path.jpg";
import scenariosImage from "@/assets/scenarios-path.jpg";

interface PathSelectionProps {
  userName: string;
  onSelectPath: (path: "talents" | "scenarios") => void;
  onBack: () => void;
}

export const PathSelection = ({ userName, onSelectPath, onBack }: PathSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome, <span className="text-primary">{userName}</span>!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose your adventure path to discover your ideal career direction
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <QuestCard
            variant="primary"
            onClick={() => onSelectPath("talents")}
            className="animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-center">
              <img
                src={talentsImage}
                alt="Unlock your talents"
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h2 className="text-2xl font-bold mb-4 text-primary">
                🎯 Unlock Your Talents
              </h2>
              <p className="text-muted-foreground mb-6">
                Discover your unique skills through interactive assessments. 
                Select your top abilities and take personalized quizzes to reveal 
                career paths that match your strengths.
              </p>
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <ul className="text-sm space-y-2 text-left">
                  <li>• Select 5 skills from 15 options</li>
                  <li>• Two-phase quiz system (50 questions)</li>
                  <li>• Personalized career recommendations</li>
                  <li>• Real job listings and industry insights</li>
                </ul>
              </div>
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <span>Est. time: 15-20 minutes</span>
              </div>
            </div>
          </QuestCard>

          <QuestCard
            variant="secondary"
            onClick={() => onSelectPath("scenarios")}
            className="animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="text-center">
              <img
                src={scenariosImage}
                alt="Real-life scenarios"
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <h2 className="text-2xl font-bold mb-4 text-secondary">
                🏢 Real-Life Scenarios
              </h2>
              <p className="text-muted-foreground mb-6">
                Explore workplace situations in your field of interest. 
                AI generates custom scenarios to reveal your problem-solving style 
                and professional personality.
              </p>
              <div className="bg-secondary/10 rounded-lg p-4 mb-4">
                <ul className="text-sm space-y-2 text-left">
                  <li>• Enter your field of interest</li>
                  <li>• AI-generated workplace scenarios</li>
                  <li>• Multiple choice decision-making</li>
                  <li>• Personality and style analysis</li>
                </ul>
              </div>
              <div className="flex items-center justify-center gap-2 text-secondary font-medium">
                <span>Est. time: 10-15 minutes</span>
              </div>
            </div>
          </QuestCard>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
          <Button
            variant="outline"
            onClick={onBack}
            className="border-border/50 hover:border-primary/50 transition-colors"
          >
            ← Back to Start
          </Button>
        </div>
      </div>
    </div>
  );
};