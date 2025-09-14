import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareerAnalysis, CareerRecommendation, PersonalityTrait } from "@/services/geminiService";

interface ResultsDisplayProps {
  analysis: CareerAnalysis;
  userName: string;
  onRestart: () => void;
}

export const ResultsDisplay = ({ analysis, userName, onRestart }: ResultsDisplayProps) => {
  const getSkillColor = (score: number) => {
    if (score >= 8) return "bg-primary";
    if (score >= 6) return "bg-secondary";
    if (score >= 4) return "bg-warning";
    return "bg-destructive";
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 80) return "text-secondary";
    if (score >= 70) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 gradient-text">
          🎯 {userName}'s Career Analysis
        </h1>
        <p className="text-xl text-muted-foreground">
          Your personalized career roadmap powered by AI
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🎯 Key Insights</h3>
              <div className="space-y-3">
                {analysis.skillPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm">{pattern}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">📊 Market Insights</h3>
              <div className="space-y-4">
                {analysis.marketInsights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">{insight.industry}</h4>
                    <p className="text-sm text-muted-foreground">
                      Demand: {insight.demandLevel} | Growth: {insight.growthRate}
                    </p>
                    <p className="text-sm font-medium">{insight.averageSalary}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Career Recommendations Tab */}
        <TabsContent value="careers" className="space-y-6">
          <div className="grid gap-6">
            {analysis.careerRecommendations.map((career, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{career.title}</h3>
                    <p className="text-muted-foreground">{career.field}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getMatchScoreColor(career.matchScore)}`}>
                      {career.matchScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">Match</p>
                  </div>
                </div>
                
                <p className="text-sm mb-4">{career.description}</p>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">💰 Salary Range</h4>
                    <p>{career.salaryRange}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">📈 Growth</h4>
                    <p>{career.growthProspects}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">⏱️ Transition Time</h4>
                    <p>{career.timeToTransition}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">🎯 Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {career.requiredSkills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🎯 Skill Gaps</h3>
              <div className="space-y-4">
                {analysis.skillGaps.map((gap, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{gap.skill}</span>
                      <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}>
                        {gap.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Current:</span>
                      <Progress value={gap.currentLevel * 10} className="flex-1" />
                      <span className="text-sm">{gap.currentLevel}/10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Target:</span>
                      <Progress value={gap.requiredLevel * 10} className="flex-1" />
                      <span className="text-sm">{gap.requiredLevel}/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Development time: {gap.developmentTime}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">📚 Learning Path</h3>
              <div className="space-y-4">
                {analysis.learningPath.map((step, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">{step.skill}</h4>
                    <p className="text-sm mb-2">{step.action}</p>
                    <div className="text-xs text-muted-foreground">
                      <p>Timeline: {step.timeline}</p>
                      <p>Goal: {step.measurableOutcome}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium">Resources:</p>
                      <ul className="text-xs text-muted-foreground">
                        {step.resources.map((resource, resourceIndex) => (
                          <li key={resourceIndex}>• {resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Personality Profile Tab */}
        <TabsContent value="personality" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.personalityProfile.map((trait, index) => (
              <Card key={index} className="p-6">
                <div className="text-center mb-4">
                  <h3 className="font-bold">{trait.trait}</h3>
                  <div className="text-3xl font-bold text-primary my-2">
                    {trait.score}/10
                  </div>
                  <Progress value={trait.score * 10} className="mb-2" />
                </div>
                <p className="text-sm text-center mb-4">{trait.description}</p>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Career Implications:</h4>
                  <div className="flex flex-wrap gap-1">
                    {trait.careerImplications.map((implication, impIndex) => (
                      <Badge key={impIndex} variant="outline" className="text-xs">
                        {implication}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-center">🗺️ Your Career Roadmap</h3>
            <div className="space-y-8">
              {/* Immediate Actions */}
              <div className="border-l-4 border-primary pl-6">
                <h4 className="text-lg font-bold mb-3">📅 Next 3 Months (Immediate Actions)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.learningPath.slice(0, 2).map((step, index) => (
                    <div key={index} className="bg-primary/5 p-4 rounded-lg">
                      <h5 className="font-semibold">{step.skill}</h5>
                      <p className="text-sm text-muted-foreground">{step.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium-term Goals */}
              <div className="border-l-4 border-secondary pl-6">
                <h4 className="text-lg font-bold mb-3">🎯 6-12 Months (Skill Building)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysis.skillGaps.filter(gap => gap.priority === 'high').map((gap, index) => (
                    <div key={index} className="bg-secondary/5 p-4 rounded-lg">
                      <h5 className="font-semibold">{gap.skill}</h5>
                      <p className="text-sm text-muted-foreground">Target level: {gap.requiredLevel}/10</p>
                      <p className="text-xs text-muted-foreground">Est. time: {gap.developmentTime}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long-term Vision */}
              <div className="border-l-4 border-accent pl-6">
                <h4 className="text-lg font-bold mb-3">🚀 1-2 Years (Career Transition)</h4>
                <div className="space-y-4">
                  {analysis.careerRecommendations.slice(0, 2).map((career, index) => (
                    <div key={index} className="bg-accent/5 p-4 rounded-lg">
                      <h5 className="font-semibold">{career.title}</h5>
                      <p className="text-sm text-muted-foreground">{career.description}</p>
                      <p className="text-xs text-muted-foreground">Transition time: {career.timeToTransition}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="text-center space-x-4">
        <Button onClick={onRestart} variant="outline" size="lg">
          Start New Assessment
        </Button>
        <Button onClick={() => window.print()} size="lg" className="gradient-primary">
          Download Report
        </Button>
      </div>
    </div>
  );
};