import { Button } from "@/components/ui/button";
import { QuestCard } from "@/components/QuestCard";

interface ScenariosPathProps {
  userName: string;
  onBack: () => void;
}

export const ScenariosPath = ({ userName, onBack }: ScenariosPathProps) => {
  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onBack}>
              ← Back to Paths
            </Button>
            <h1 className="text-2xl font-bold">
              {userName}'s Scenario Analysis
            </h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="animate-fade-in-up">
          <QuestCard className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-secondary">
              🏢 Real-Life Scenarios
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              This exciting path will be implemented next! Here you'll:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-secondary/10 p-4 rounded-lg">
                <h3 className="font-bold mb-2">🎯 Field Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your field of interest and let AI generate relevant workplace scenarios
                </p>
              </div>
              
              <div className="bg-secondary/10 p-4 rounded-lg">
                <h3 className="font-bold mb-2">🤖 AI-Powered Scenarios</h3>
                <p className="text-sm text-muted-foreground">
                  Experience custom workplace situations tailored to your chosen field
                </p>
              </div>
              
              <div className="bg-secondary/10 p-4 rounded-lg">
                <h3 className="font-bold mb-2">🎭 Decision Making</h3>
                <p className="text-sm text-muted-foreground">
                  Make choices that reveal your problem-solving and leadership style
                </p>
              </div>
              
              <div className="bg-secondary/10 p-4 rounded-lg">
                <h3 className="font-bold mb-2">📊 Personality Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get insights into your professional personality and work preferences
                </p>
              </div>
            </div>
          </QuestCard>
        </div>
      </div>
    </div>
  );
};