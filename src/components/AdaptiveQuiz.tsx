import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { geminiService, AdaptiveQuestion } from "@/services/geminiService";
import { useToast } from "@/hooks/use-toast";

interface AdaptiveQuizProps {
  selectedSkills: string[];
  onComplete: (responses: QuizResponse[]) => void;
  phase: 'initial' | 'deep-dive' | 'validation';
  totalQuestions: number;
}

export interface QuizResponse {
  questionId: string;
  question: string;
  answer: any;
  reasoning?: string;
  skillsAssessed: string[];
  timestamp: Date;
}

export const AdaptiveQuiz = ({ selectedSkills, onComplete, phase, totalQuestions }: AdaptiveQuizProps) => {
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [reasoning, setReasoning] = useState("");
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load initial questions
  useEffect(() => {
    loadInitialQuestions();
  }, [selectedSkills, phase]);

  const loadInitialQuestions = async () => {
    console.log('🔄 Loading initial questions for phase:', phase);
    setIsLoading(true);
    try {
      const initialQuestions = await geminiService.generateAdaptiveQuestions(
        selectedSkills,
        responses,
        phase
      );
      
      if (initialQuestions && initialQuestions.length > 0) {
        console.log('✅ Loaded', initialQuestions.length, 'questions');
        setQuestions(initialQuestions);
      } else {
        console.log('⚠️ No questions received, showing error');
        toast({
          title: "Loading Error",
          description: "Unable to load questions. Please refresh and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer) {
      toast({
        title: "Please select an answer",
        description: "You need to choose an option before continuing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];
    const newResponse: QuizResponse = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: currentAnswer,
      reasoning: reasoning.trim() || undefined,
      skillsAssessed: currentQuestion.skillsAssessed,
      timestamp: new Date()
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    
    console.log('📝 Recorded response:', newResponse.questionId, 'Total responses:', updatedResponses.length);

    // Check if we've reached the target number of questions
    if (updatedResponses.length >= totalQuestions) {
      console.log('🎯 Assessment complete! Total responses:', updatedResponses.length);
      onComplete(updatedResponses);
      setIsSubmitting(false);
      return;
    }

    // Check if we need more questions
    if (currentQuestionIndex + 1 >= questions.length) {
      console.log('🔄 Need more questions, generating...');
      try {
        const nextQuestions = await geminiService.generateAdaptiveQuestions(
          selectedSkills,
          updatedResponses,
          phase
        );
        
        if (nextQuestions && nextQuestions.length > 0) {
          console.log('✅ Generated', nextQuestions.length, 'additional questions');
          setQuestions(prev => [...prev, ...nextQuestions]);
        } else {
          console.log('⚠️ No additional questions generated');
        }
      } catch (error) {
        console.error('❌ Error generating additional questions:', error);
        toast({
          title: "Error",
          description: "Failed to generate next question. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    setCurrentAnswer(null);
    setReasoning("");
    setIsSubmitting(false);
  };

  const renderQuestionInput = (question: AdaptiveQuestion) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">
                {currentAnswer || 5}
              </span>
              <p className="text-sm text-muted-foreground">
                {currentAnswer <= 3 ? 'Strongly Disagree' : 
                 currentAnswer <= 5 ? 'Neutral' : 
                 currentAnswer <= 7 ? 'Agree' : 'Strongly Agree'}
              </p>
            </div>
            <Slider
              value={[currentAnswer || 5]}
              onValueChange={(value) => setCurrentAnswer(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>1 - Strongly Disagree</span>
              <span>10 - Strongly Agree</span>
            </div>
          </div>
        );

      case 'scenario':
        return (
          <div className="space-y-4">
            {question.scenario && (
              <div className="bg-secondary/10 p-4 rounded-lg">
                <p className="text-sm">{question.scenario}</p>
              </div>
            )}
            <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`scenario-${index}`} />
                  <Label htmlFor={`scenario-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Click to rank these options from most (1) to least important:
            </p>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={currentAnswer === option ? "default" : "outline"}
                  onClick={() => setCurrentAnswer(option)}
                  className="w-full justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <Textarea
            placeholder="Please describe your thoughts..."
            value={currentAnswer || ''}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="min-h-[100px]"
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
            <div>
              <h2 className="text-xl font-bold mb-2">🤖 Generating Your Questions</h2>
              <p className="text-muted-foreground">
                AI is creating personalized questions based on your selected skills...
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-primary/10 p-3 rounded">
                ✓ Analyzing Skills
              </div>
              <div className="bg-secondary/10 p-3 rounded">
                ✓ Crafting Questions
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-4">Unable to Load Questions</h2>
          <p className="text-muted-foreground mb-6">
            We're having trouble generating your personalized assessment. Please try again.
          </p>
          <Button onClick={loadInitialQuestions}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (responses.length / totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {responses.length + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">
              {currentQuestion?.question}
            </h2>
            {currentQuestion?.skillsAssessed.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Assessing:</span>
                {currentQuestion.skillsAssessed.map((skill, index) => (
                  <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {currentQuestion && renderQuestionInput(currentQuestion)}

          {/* Optional reasoning */}
          <div>
            <Label htmlFor="reasoning" className="text-sm font-medium">
              Why did you choose this answer? (Optional)
            </Label>
            <Textarea
              id="reasoning"
              placeholder="Share your reasoning to help us understand your thinking..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleAnswerSubmit}
              disabled={!currentAnswer || isSubmitting}
              className="gradient-primary"
            >
              {isSubmitting ? 'Processing...' : 
               responses.length + 1 >= totalQuestions ? 'Complete Assessment' : 'Next Question'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Phase Information */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Phase: {phase === 'initial' ? '🔍 Initial Assessment' : 
                  phase === 'deep-dive' ? '🎯 Deep Dive Analysis' : 
                  '✅ Validation & Refinement'}
        </p>
        <p className="mt-1">
          Questions loaded: {questions.length} | Responses: {responses.length}/{totalQuestions}
        </p>
      </div>
    </div>
  );
};