import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { geminiService } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

interface ScenarioQuizProps {
  fieldOfInterest: string;
  userName: string;
  onComplete: (results: any) => void;
}

interface ScenarioResponse {
  scenario: string;
  selectedOption: any;
  reasoning?: string;
  timestamp: Date;
}

export const ScenarioQuiz = ({ fieldOfInterest, userName, onComplete }: ScenarioQuizProps) => {
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [responses, setResponses] = useState<ScenarioResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [reasoning, setReasoning] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const [scenarioCount, setScenarioCount] = useState(0);
  const { toast } = useToast();

  const totalScenarios = 5;

  useEffect(() => {
    generateFirstScenario();
  }, [fieldOfInterest]);

  const generateFirstScenario = async () => {
    setIsLoading(true);
    try {
      const scenario = await geminiService.generateWorkplaceScenario(
        fieldOfInterest,
        { name: userName },
        []
      );
      setCurrentScenario(scenario);
      setScenarioCount(1);
    } catch (error) {
      console.error('Error generating scenario:', error);
      
      // Check if it's a quota exceeded error
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('exceeded')) {
        toast({
          title: "AI Quota Reached",
          description: "We've reached our daily AI limit. Using pre-designed scenarios to continue your assessment.",
          variant: "default",
        });
        
        // Generate fallback scenario immediately
        try {
          const fallbackScenario = geminiService.getFallbackScenario(fieldOfInterest);
          setCurrentScenario(fallbackScenario);
          setScenarioCount(1);
        } catch (fallbackError) {
          console.error('Fallback scenario generation failed:', fallbackError);
          toast({
            title: "Error",
            description: "Unable to generate scenarios. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Connection Issue",
          description: "Having trouble connecting to AI services. Using offline scenarios to continue.",
          variant: "default",
        });
        
        // Try fallback scenario for any other error
        try {
          const fallbackScenario = geminiService.getFallbackScenario(fieldOfInterest);
          setCurrentScenario(fallbackScenario);
          setScenarioCount(1);
        } catch (fallbackError) {
          console.error('Fallback scenario generation failed:', fallbackError);
          toast({
            title: "Error",
            description: "Unable to generate scenarios. Please try again later.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioSubmit = async () => {
    if (!selectedOption) return;

    const selectedOptionData = currentScenario.options.find(
      (opt: any) => opt.id === selectedOption
    );

    const newResponse: ScenarioResponse = {
      scenario: currentScenario.scenario,
      selectedOption: selectedOptionData,
      reasoning: reasoning.trim() || undefined,
      timestamp: new Date()
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Check if we've completed all scenarios
    if (scenarioCount >= totalScenarios) {
      try {
        const analysis = await geminiService.analyzeScenarioResponses(
          fieldOfInterest,
          updatedResponses
        );
        onComplete(analysis);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to analyze responses. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Generate next scenario
    setIsGeneratingNext(true);
    try {
      const nextScenario = await geminiService.generateWorkplaceScenario(
        fieldOfInterest,
        { name: userName, previousResponses: updatedResponses },
        updatedResponses.map(r => r.scenario)
      );
      
      setCurrentScenario(nextScenario);
      setScenarioCount(prev => prev + 1);
      setSelectedOption("");
      setReasoning("");
    } catch (error) {
      console.error('Error generating next scenario:', error);
      
      // Check if it's a quota exceeded error
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('exceeded')) {
        toast({
          title: "AI Quota Reached",
          description: "Continuing with pre-designed scenarios.",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Issue", 
          description: "Using offline scenarios to continue your assessment.",
          variant: "default",
        });
      }
      
      // Use fallback scenario
      try {
        const fallbackScenario = geminiService.getFallbackScenario(fieldOfInterest);
        setCurrentScenario(fallbackScenario);
        setScenarioCount(prev => prev + 1);
        setSelectedOption("");
        setReasoning("");
      } catch (fallbackError) {
        console.error('Fallback scenario failed:', fallbackError);
        toast({
          title: "Error",
          description: "Unable to continue. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingNext(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-secondary rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-secondary rounded w-full"></div>
            <div className="h-4 bg-secondary rounded w-5/6 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-10 bg-secondary rounded"></div>
              <div className="h-10 bg-secondary rounded"></div>
              <div className="h-10 bg-secondary rounded"></div>
            </div>
          </div>
          <p className="mt-6 text-muted-foreground">
            🤖 AI is creating a personalized {fieldOfInterest} scenario for you...
          </p>
        </Card>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-4">Unable to Generate Scenario</h2>
          <p className="text-muted-foreground mb-6">
            We're having trouble creating your personalized scenario. Please try again.
          </p>
          <Button onClick={generateFirstScenario}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const progress = (scenarioCount / totalScenarios) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Scenario {scenarioCount} of {totalScenarios}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scenario Card */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Scenario Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              🏢 {currentScenario.scenario}
            </h2>
            <Badge variant="secondary" className="mb-4">
              {fieldOfInterest} Scenario
            </Badge>
          </div>

          {/* Context */}
          <div className="bg-secondary/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">📋 Situation</h3>
            <p className="text-sm leading-relaxed">{currentScenario.context}</p>
          </div>

          {/* Challenge */}
          <div className="bg-warning/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">⚡ Challenge</h3>
            <p className="text-sm leading-relaxed">{currentScenario.challenge}</p>
          </div>

          {/* Options */}
          <div>
            <h3 className="font-semibold mb-4">🤔 How would you handle this situation?</h3>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="space-y-4">
                {currentScenario.options.map((option: any, index: number) => (
                  <div
                    key={option.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedOption === option.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="cursor-pointer text-sm leading-relaxed">
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option.text}
                        </Label>
                        
                        {/* Show skills and personality traits for selected option */}
                        {selectedOption === option.id && (
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Skills demonstrated:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {option.skills.map((skill: string, skillIndex: number) => (
                                  <Badge key={skillIndex} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">Personality traits:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {option.personality.map((trait: string, traitIndex: number) => (
                                  <Badge key={traitIndex} variant="secondary" className="text-xs">
                                    {trait}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Reasoning */}
          <div>
            <Label htmlFor="reasoning" className="text-sm font-medium">
              💭 Explain your reasoning (Optional but recommended)
            </Label>
            <Textarea
              id="reasoning"
              placeholder="Why did you choose this approach? What factors influenced your decision?"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              className="mt-2 min-h-[80px]"
            />
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={handleScenarioSubmit}
              disabled={!selectedOption || isGeneratingNext}
              size="lg"
              className="gradient-primary"
            >
              {isGeneratingNext ? (
                <>🤖 Generating Next Scenario...</>
              ) : scenarioCount >= totalScenarios ? (
                <>🎯 Complete Analysis</>
              ) : (
                <>Continue to Next Scenario</>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Follow-up Questions Preview */}
      {currentScenario.followUpQuestions && currentScenario.followUpQuestions.length > 0 && (
        <Card className="p-6 bg-primary/5">
          <h3 className="font-semibold mb-3">🤔 Think about these questions:</h3>
          <ul className="space-y-1 text-sm">
            {currentScenario.followUpQuestions.map((question: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          🎭 Analyzing your decision-making patterns and leadership style through real-world scenarios
        </p>
      </div>
    </div>
  );
};