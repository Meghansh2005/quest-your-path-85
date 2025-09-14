import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuestCard } from "@/components/QuestCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScenarioQuiz } from "@/components/ScenarioQuiz";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { CareerAnalysis } from "@/services/geminiService";

interface ScenariosPathProps {
  userName: string;
  onBack: () => void;
}

type ScenarioPhase = "field-selection" | "scenarios" | "results";

export const ScenariosPath = ({ userName, onBack }: ScenariosPathProps) => {
  const [phase, setPhase] = useState<ScenarioPhase>("field-selection");
  const [fieldOfInterest, setFieldOfInterest] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleFieldSubmit = () => {
    if (fieldOfInterest.trim()) {
      setPhase("scenarios");
    }
  };

  const handleScenariosComplete = (results: any) => {
    setAnalysisResults(results);
    setPhase("results");
  };

  const handleRestart = () => {
    setPhase("field-selection");
    setFieldOfInterest("");
    setAnalysisResults(null);
  };

  const convertToCareerAnalysis = (scenarioResults: any): CareerAnalysis => {
    return {
      skillPatterns: [`${scenarioResults.problemSolvingApproach} problem solver`, scenarioResults.leadershipStyle],
      careerRecommendations: scenarioResults.careerRecommendations || [],
      skillGaps: [],
      learningPath: scenarioResults.developmentAreas?.map((area: string) => ({
        skill: area,
        action: `Develop ${area} through targeted practice`,
        resources: ["Online courses", "Professional workshops", "Mentoring"],
        timeline: "3-6 months",
        measurableOutcome: `Improved competency in ${area}`
      })) || [],
      personalityProfile: scenarioResults.personalityProfile || [],
      marketInsights: [{
        industry: fieldOfInterest,
        demandLevel: "Moderate",
        averageSalary: "Market Rate",
        growthRate: "Industry Average",
        keyTrends: ["Digital transformation", "Remote work adaptation"],
        emergingRoles: ["Hybrid roles", "Cross-functional positions"]
      }]
    };
  };

  const renderFieldSelection = () => (
    <div className="max-w-2xl mx-auto">
      <QuestCard className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">🎯 Choose Your Field of Interest</h2>
          <p className="text-muted-foreground">
            Enter the industry or field where you'd like to explore career scenarios
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="field" className="text-base font-medium">
              Field of Interest
            </Label>
            <Input
              id="field"
              placeholder="e.g., Technology, Healthcare, Finance, Marketing, Education..."
              value={fieldOfInterest}
              onChange={(e) => setFieldOfInterest(e.target.value)}
              className="mt-2 text-lg p-6"
              onKeyPress={(e) => e.key === 'Enter' && handleFieldSubmit()}
            />
          </div>

          <div className="bg-secondary/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">💡 What you'll experience:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• AI-generated workplace scenarios specific to your field</li>
              <li>• Real-world challenges that reveal your problem-solving style</li>
              <li>• Decision-making situations that uncover leadership preferences</li>
              <li>• Personalized personality analysis based on your choices</li>
            </ul>
          </div>

          <Button
            onClick={handleFieldSubmit}
            disabled={!fieldOfInterest.trim()}
            size="lg"
            className="w-full gradient-primary"
          >
            Generate My Scenarios
          </Button>
        </div>
      </QuestCard>
    </div>
  );

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
          {phase === "field-selection" && renderFieldSelection()}
          
          {phase === "scenarios" && (
            <ScenarioQuiz
              fieldOfInterest={fieldOfInterest}
              userName={userName}
              onComplete={handleScenariosComplete}
            />
          )}
          
          {phase === "results" && analysisResults && (
            <ResultsDisplay
              analysis={convertToCareerAnalysis(analysisResults)}
              userName={userName}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
};