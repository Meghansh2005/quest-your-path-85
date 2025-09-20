import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CareerAnalysis, CareerRecommendation, PersonalityTrait, SkillDetail } from "@/services/geminiService";

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="skill-details">Skill Details</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">🎯 Key Insights</h3>
              <div className="space-y-3">
                {(Array.isArray(analysis.skillPatterns) ? analysis.skillPatterns : []).map((pattern, index) => (
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
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Market Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    Demand: {analysis.marketInsights.demandLevel} | Competition: {analysis.marketInsights.competitionLevel}
                  </p>
                  <div className="mt-2">
                    <h5 className="text-sm font-medium mb-1">Trending Skills:</h5>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(analysis.marketInsights?.trendingSkills) ? analysis.marketInsights.trendingSkills : []).map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Career Recommendations Tab */}
        <TabsContent value="careers" className="space-y-6">
          <div className="grid gap-6">
            {(Array.isArray(analysis.careerRecommendations) ? analysis.careerRecommendations : []).map((career, index) => (
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
                    {(Array.isArray(career.requiredSkills) ? career.requiredSkills : []).map((skill, skillIndex) => (
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
                {(Array.isArray(analysis.skillGaps) ? analysis.skillGaps : []).map((gap, index) => (
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
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📚</span>
                <span>AI-Generated Learning Path</span>
                <Badge variant="secondary" className="text-xs">Powered by Gemini</Badge>
              </h3>
              <div className="space-y-8">
                {(Array.isArray(analysis.learningPath) ? analysis.learningPath : []).map((step, index) => {
                  // Enhanced color schemes for learning path items
                  const pathColors = [
                    {
                      gradient: 'from-blue-50/80 via-indigo-50/60 to-purple-50/80',
                      border: 'border-blue-300/40',
                      accent: 'text-blue-600',
                      badge: 'bg-blue-100 text-blue-700',
                      sections: {
                        action: 'bg-blue-50/90 border-blue-200/50',
                        timeline: 'bg-indigo-50/90 border-indigo-200/50',
                        success: 'bg-purple-50/90 border-purple-200/50',
                        prerequisites: 'bg-amber-50/90 border-amber-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    },
                    {
                      gradient: 'from-emerald-50/80 via-teal-50/60 to-cyan-50/80',
                      border: 'border-emerald-300/40',
                      accent: 'text-emerald-600',
                      badge: 'bg-emerald-100 text-emerald-700',
                      sections: {
                        action: 'bg-emerald-50/90 border-emerald-200/50',
                        timeline: 'bg-teal-50/90 border-teal-200/50',
                        success: 'bg-cyan-50/90 border-cyan-200/50',
                        prerequisites: 'bg-amber-50/90 border-amber-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    },
                    {
                      gradient: 'from-rose-50/80 via-pink-50/60 to-fuchsia-50/80',
                      border: 'border-rose-300/40',
                      accent: 'text-rose-600',
                      badge: 'bg-rose-100 text-rose-700',
                      sections: {
                        action: 'bg-rose-50/90 border-rose-200/50',
                        timeline: 'bg-pink-50/90 border-pink-200/50',
                        success: 'bg-fuchsia-50/90 border-fuchsia-200/50',
                        prerequisites: 'bg-amber-50/90 border-amber-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    },
                    {
                      gradient: 'from-orange-50/80 via-amber-50/60 to-yellow-50/80',
                      border: 'border-orange-300/40',
                      accent: 'text-orange-600',
                      badge: 'bg-orange-100 text-orange-700',
                      sections: {
                        action: 'bg-orange-50/90 border-orange-200/50',
                        timeline: 'bg-amber-50/90 border-amber-200/50',
                        success: 'bg-yellow-50/90 border-yellow-200/50',
                        prerequisites: 'bg-red-50/90 border-red-300/50',
                        resources: 'bg-slate-50/90 border-slate-200/50'
                      }
                    }
                  ];
                  
                  const scheme = pathColors[index % pathColors.length];
                  
                  return (
                    <div key={index} className={`border-2 rounded-xl p-6 bg-gradient-to-br ${scheme.gradient} ${scheme.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-white/70 flex items-center justify-center font-bold ${scheme.accent} text-sm shadow-sm`}>
                            {index + 1}
                          </div>
                          <h4 className={`font-bold text-xl ${scheme.accent}`}>{step.skill}</h4>
                        </div>
                        {step.difficultyLevel && (
                          <Badge className={`${scheme.badge} border-0 shadow-sm`}>
                            {step.difficultyLevel}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className={`${scheme.sections.action} p-4 rounded-lg border backdrop-blur-sm`}>
                          <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <span className="text-base">📋</span>
                            <span className={scheme.accent}>Comprehensive Action Plan</span>
                          </h5>
                          <p className="text-sm leading-relaxed text-gray-700">{step.action}</p>
                          
                          {/* Enhanced AI insights */}
                          <div className="mt-3 p-3 bg-white/50 rounded-md border border-white/20">
                            <h6 className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                              <span>🤖</span>
                              <span>AI Learning Strategy</span>
                            </h6>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Focus on hands-on application rather than passive learning. Build projects that demonstrate your understanding and can be showcased in your portfolio. Consider finding a study partner or mentor to accelerate your progress.
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className={`${scheme.sections.timeline} p-4 rounded-lg border backdrop-blur-sm`}>
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <span className="text-base">⏰</span>
                              <span className={scheme.accent}>Smart Timeline</span>
                            </h5>
                            <p className="text-sm text-gray-700 mb-2">{step.timeline}</p>
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1 mb-1">
                                <span>📅</span>
                                <span>Weekly commitment: 8-12 hours</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>🎯</span>
                                <span>Daily practice: 1-2 hours</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`${scheme.sections.success} p-4 rounded-lg border backdrop-blur-sm`}>
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <span className="text-base">🎯</span>
                              <span className={scheme.accent}>Success Metrics</span>
                            </h5>
                            <p className="text-sm text-gray-700 mb-2">{step.measurableOutcome}</p>
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1 mb-1">
                                <span>✅</span>
                                <span>Portfolio projects completed</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>📈</span>
                                <span>Skill assessment improvements</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {step.prerequisites && (
                          <div className={`${scheme.sections.prerequisites} p-4 rounded-lg border border-amber-300/40`}>
                            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <span className="text-base">⚡</span>
                              <span className="text-amber-700">Prerequisites & Preparation</span>
                            </h5>
                            <p className="text-sm text-gray-700 mb-2">{step.prerequisites}</p>
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <span>📚</span>
                                <span>Recommended prep time: 1-2 weeks</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className={`${scheme.sections.resources} p-4 rounded-lg border backdrop-blur-sm`}>
                          <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <span className="text-base">📚</span>
                            <span className={scheme.accent}>Curated Learning Resources</span>
                          </h5>
                          <div className="grid gap-3">
                            {(Array.isArray(step.resources) ? step.resources : []).map((resource, resourceIndex) => {
                              const resourceTypes = ['🎥', '📚', '💻', '🎯', '✨'];
                              const resourceIcon = resourceTypes[resourceIndex % resourceTypes.length];
                              
                              return (
                                <div key={resourceIndex} className="flex items-start gap-3 text-sm bg-white/40 p-3 rounded-lg border border-white/20">
                                  <span className="text-base flex-shrink-0 mt-0.5">{resourceIcon}</span>
                                  <div className="flex-1">
                                    <span className="text-gray-700 leading-relaxed">{resource}</span>
                                    {resourceIndex === 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                          🔥 Most Recommended
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* AI Study Tips */}
                          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg border border-blue-200/30">
                            <h6 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                              <span>🧪</span>
                              <span>AI Study Tips</span>
                            </h6>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>• Use the Pomodoro Technique: 25min focused study + 5min break</div>
                              <div>• Join online communities and forums related to {step.skill}</div>
                              <div>• Document your learning journey in a blog or journal</div>
                              <div>• Practice explaining concepts to others to reinforce understanding</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {(!analysis.learningPath || analysis.learningPath.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-200/30">
                    <div className="text-4xl mb-4">🤖</div>
                    <h4 className="text-lg font-semibold mb-2">AI Learning Path Generation</h4>
                    <p>Your personalized learning roadmap will be generated based on your assessment results.</p>
                    <p className="text-sm mt-2">Complete the full assessment to unlock AI-powered learning recommendations.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Skill Details Tab */}
        <TabsContent value="skill-details" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span>📈</span>
              <span>Deep Skill Analysis</span>
              <Badge variant="secondary" className="text-xs">Powered by Gemini</Badge>
            </h2>
            <p className="text-muted-foreground">Comprehensive analysis of your top 2 skills with industry insights, blog content, and career progression</p>
          </div>
          
          {analysis.skillDetails && analysis.skillDetails.length > 0 ? (
            <div className="space-y-8">
              {analysis.skillDetails.map((skillDetail, index) => (
                <Card key={index} className="p-6 bg-gradient-to-br from-card/50 to-card/80 backdrop-blur-sm border border-border/50">
                  <div className="space-y-6">
                    {/* Skill Header */}
                    <div className="text-center border-b pb-4">
                      <h3 className="text-2xl font-bold text-primary">{skillDetail.skillName}</h3>
                      <p className="text-muted-foreground mt-2">{skillDetail.overview}</p>
                      
                      {/* Market Demand Summary */}
                      <div className="flex justify-center gap-4 mt-4">
                        <div className="text-center">
                          <div className="font-semibold text-primary">{skillDetail.marketDemand.level}</div>
                          <div className="text-xs text-muted-foreground">Demand</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-secondary">{skillDetail.marketDemand.growth}</div>
                          <div className="text-xs text-muted-foreground">Growth</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-accent">{skillDetail.marketDemand.averageSalary}</div>
                          <div className="text-xs text-muted-foreground">Salary</div>
                        </div>
                      </div>
                    </div>

                    {/* Industry Analysis */}
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>🏢</span>
                        <span>Industry Breakdown</span>
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {skillDetail.industries.map((industry, industryIndex) => (
                          <div key={industryIndex} className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border/50 hover:bg-card/90 transition-colors">
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-semibold text-foreground">{industry.name}</h5>
                              <Badge variant={industry.demand === 'Extremely High' ? 'destructive' : industry.demand === 'Very High' ? 'default' : 'secondary'}>
                                {industry.demand}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              <div>
                                <h6 className="font-medium text-green-400 mb-1 flex items-center gap-1">
                                  <span>✅</span>
                                  <span>Pros</span>
                                </h6>
                                <ul className="space-y-1">
                                  {industry.pros.map((pro, proIndex) => (
                                    <li key={proIndex} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-green-400 rounded-full flex-shrink-0"></div>
                                      <span className="text-foreground/90 text-xs leading-relaxed">{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="font-medium text-red-400 mb-1 flex items-center gap-1">
                                  <span>❌</span>
                                  <span>Cons</span>
                                </h6>
                                <ul className="space-y-1">
                                  {industry.cons.map((con, conIndex) => (
                                    <li key={conIndex} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></div>
                                      <span className="text-foreground/90 text-xs leading-relaxed">{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="border-t border-border/50 pt-2">
                                <div className="font-medium text-primary">{industry.avgSalary}</div>
                                <div className="text-xs text-muted-foreground">Average Salary</div>
                              </div>
                              
                              <div>
                                <h6 className="font-medium mb-1 text-foreground flex items-center gap-1">
                                  <span>💼</span>
                                  <span>Job Titles</span>
                                </h6>
                                <div className="flex flex-wrap gap-1">
                                  {industry.jobTitles.map((title, titleIndex) => (
                                    <Badge key={titleIndex} variant="outline" className="text-xs bg-background/50 border-border/50 text-foreground/80">
                                      {title}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Blog Post Section */}
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>📝</span>
                        <span>Expert Blog Post</span>
                      </h4>
                      <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border/50">
                        <h5 className="text-xl font-bold mb-4 text-primary">{skillDetail.blogPost.title}</h5>
                        <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                          {skillDetail.blogPost.content.split('\\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="mb-3 text-foreground/85">{paragraph}</p>
                          ))}
                        </div>
                        
                        <div className="mt-6">
                          <h6 className="font-semibold mb-3 text-secondary flex items-center gap-2">
                            <span>💡</span>
                            <span>Key Takeaways</span>
                          </h6>
                          <div className="grid md:grid-cols-2 gap-2">
                            {skillDetail.blogPost.keyTakeaways.map((takeaway, takeawayIndex) => (
                              <div key={takeawayIndex} className="flex items-center gap-2 bg-secondary/20 border border-secondary/30 p-3 rounded-lg">
                                <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></div>
                                <span className="text-sm text-foreground/90">{takeaway}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Resources & Career Progression */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Learning Resources */}
                      <div>
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <span>📚</span>
                          <span>Learning Resources</span>
                        </h4>
                        <div className="space-y-3">
                          {skillDetail.learningResources.map((resource, resourceIndex) => (
                            <div key={resourceIndex} className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border/50 hover:bg-card/90 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h6 className="font-semibold text-foreground">{resource.title}</h6>
                                <Badge variant={resource.difficulty === 'Advanced' ? 'destructive' : resource.difficulty === 'Intermediate' ? 'default' : 'secondary'}>
                                  {resource.difficulty}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs bg-background/50 border-border/50 text-foreground/80">{resource.type}</Badge>
                              </div>
                              <p className="text-sm text-foreground/85 leading-relaxed">{resource.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Career Progression */}
                      <div>
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <span>🚀</span>
                          <span>Career Progression</span>
                        </h4>
                        <div className="space-y-4">
                          {/* Entry Level */}
                          <div className="bg-card/80 border border-green-500/30 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h6 className="font-semibold text-green-400 flex items-center gap-2">
                                <span>🌱</span>
                                <span>{skillDetail.careerProgression.entry.title}</span>
                              </h6>
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">{skillDetail.careerProgression.entry.salary}</Badge>
                            </div>
                            <ul className="text-sm space-y-1">
                              {skillDetail.careerProgression.entry.requirements.map((req, reqIndex) => (
                                <li key={reqIndex} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-green-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-foreground/85">{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Mid Level */}
                          <div className="bg-card/80 border border-blue-500/30 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h6 className="font-semibold text-blue-400 flex items-center gap-2">
                                <span>🚀</span>
                                <span>{skillDetail.careerProgression.mid.title}</span>
                              </h6>
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{skillDetail.careerProgression.mid.salary}</Badge>
                            </div>
                            <ul className="text-sm space-y-1">
                              {skillDetail.careerProgression.mid.requirements.map((req, reqIndex) => (
                                <li key={reqIndex} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-foreground/85">{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Senior Level */}
                          <div className="bg-card/80 border border-purple-500/30 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-2">
                              <h6 className="font-semibold text-purple-400 flex items-center gap-2">
                                <span>🏆</span>
                                <span>{skillDetail.careerProgression.senior.title}</span>
                              </h6>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{skillDetail.careerProgression.senior.salary}</Badge>
                            </div>
                            <ul className="text-sm space-y-1">
                              {skillDetail.careerProgression.senior.requirements.map((req, reqIndex) => (
                                <li key={reqIndex} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-purple-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-foreground/85">{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-lg font-semibold mb-2">Detailed Skill Analysis Coming Soon</h3>
                <p>Complete the full assessment to unlock comprehensive skill insights with industry analysis and career guidance.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Personality Profile Tab */}
        <TabsContent value="personality" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span>🧠</span>
              <span>AI Personality Analysis</span>
              <Badge variant="secondary" className="text-xs">Powered by Gemini</Badge>
            </h2>
            <p className="text-muted-foreground">Deep insights into your work style, decision-making patterns, and professional strengths</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.personalityProfile?.map((trait, index) => {
              // Dynamic color schemes based on trait index
              const colorSchemes = [
                {
                  gradient: 'from-blue-50 via-indigo-50 to-purple-50',
                  border: 'border-blue-200/60',
                  scoreColor: 'text-blue-600',
                  progressBg: 'bg-blue-500',
                  sections: {
                    behavioral: 'bg-blue-50/80 border-blue-200/40',
                    career: 'bg-indigo-50/80 border-indigo-200/40',
                    workplace: 'bg-purple-50/80 border-purple-200/40'
                  },
                  icons: {
                    behavioral: '🎭',
                    career: '🎯',
                    workplace: '🏢'
                  },
                  shadow: 'hover:shadow-blue-200/25'
                },
                {
                  gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
                  border: 'border-emerald-200/60',
                  scoreColor: 'text-emerald-600',
                  progressBg: 'bg-emerald-500',
                  sections: {
                    behavioral: 'bg-emerald-50/80 border-emerald-200/40',
                    career: 'bg-teal-50/80 border-teal-200/40',
                    workplace: 'bg-cyan-50/80 border-cyan-200/40'
                  },
                  icons: {
                    behavioral: '🌱',
                    career: '🎯',
                    workplace: '💼'
                  },
                  shadow: 'hover:shadow-emerald-200/25'
                },
                {
                  gradient: 'from-rose-50 via-pink-50 to-fuchsia-50',
                  border: 'border-rose-200/60',
                  scoreColor: 'text-rose-600',
                  progressBg: 'bg-rose-500',
                  sections: {
                    behavioral: 'bg-rose-50/80 border-rose-200/40',
                    career: 'bg-pink-50/80 border-pink-200/40',
                    workplace: 'bg-fuchsia-50/80 border-fuchsia-200/40'
                  },
                  icons: {
                    behavioral: '💡',
                    career: '🚀',
                    workplace: '⭐'
                  },
                  shadow: 'hover:shadow-rose-200/25'
                },
                {
                  gradient: 'from-amber-50 via-orange-50 to-red-50',
                  border: 'border-amber-200/60',
                  scoreColor: 'text-amber-600',
                  progressBg: 'bg-amber-500',
                  sections: {
                    behavioral: 'bg-amber-50/80 border-amber-200/40',
                    career: 'bg-orange-50/80 border-orange-200/40',
                    workplace: 'bg-red-50/80 border-red-200/40'
                  },
                  icons: {
                    behavioral: '🔥',
                    career: '⚡',
                    workplace: '🎪'
                  },
                  shadow: 'hover:shadow-amber-200/25'
                }
              ];
              
              const scheme = colorSchemes[index % colorSchemes.length];
              
              return (
                <Card key={index} className={`p-6 bg-gradient-to-br ${scheme.gradient} ${scheme.border} border-2 transition-all duration-300 ${scheme.shadow} hover:shadow-lg transform hover:-translate-y-1`}>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl text-gray-800">{trait.trait}</h3>
                      <div className={`text-3xl font-bold ${scheme.scoreColor} bg-white/60 px-4 py-2 rounded-full shadow-sm`}>
                        {trait.score}/10
                      </div>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={trait.score * 10} 
                        className="mb-3 h-3 bg-white/50 rounded-full shadow-inner" 
                      />
                      <div className="absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ease-out" 
                           style={{
                             width: `${trait.score * 10}%`,
                             background: `linear-gradient(90deg, ${scheme.progressBg.replace('bg-', '')} 0%, ${scheme.progressBg.replace('bg-', '').replace('-500', '-400')} 100%)`
                           }}>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`${scheme.sections.behavioral} p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:shadow-md`}>
                      <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
                        <span className="text-lg">{scheme.icons.behavioral}</span>
                        <span>Behavioral Profile</span>
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-700">{trait.description}</p>
                    </div>
                    
                    <div className={`${scheme.sections.career} p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:shadow-md`}>
                      <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
                        <span className="text-lg">{scheme.icons.career}</span>
                        <span>Career Implications</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(trait.careerImplications) ? trait.careerImplications : []).map((implication, impIndex) => (
                          <Badge key={impIndex} variant="outline" className="text-xs bg-white/60 border-gray-300/50 text-gray-700 hover:bg-white/80 transition-colors">
                            {implication}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {trait.workplaceExamples && Array.isArray(trait.workplaceExamples) && (
                      <div className={`${scheme.sections.workplace} p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:shadow-md`}>
                        <h4 className="font-semibold text-sm mb-3 text-gray-700 flex items-center gap-2">
                          <span className="text-lg">{scheme.icons.workplace}</span>
                          <span>Workplace Strengths</span>
                        </h4>
                        <div className="space-y-2">
                          {trait.workplaceExamples.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="flex items-center gap-3 text-sm text-gray-700 bg-white/40 p-2 rounded-lg">
                              <div className="w-2 h-2 bg-gradient-to-r from-current to-transparent rounded-full opacity-70"></div>
                              <span>{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          
          {(!analysis.personalityProfile || analysis.personalityProfile.length === 0) && (
            <Card className="p-8">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-lg font-semibold mb-2">Personality Analysis Coming Soon</h3>
                <p>Complete the full assessment to unlock detailed personality insights powered by AI.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <span>🗺️</span>
              <span>AI-Generated Career Roadmap</span>
              <Badge variant="secondary" className="text-xs">Powered by Gemini</Badge>
            </h2>
            <p className="text-muted-foreground">Your personalized step-by-step career advancement plan</p>
          </div>
          
          <Card className="p-6">
            <div className="space-y-8">
              {/* Immediate Actions - Enhanced */}
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>💼</span>
                  <span>Phase 1: Immediate Actions (Next 3 Months)</span>
                </h3>
                
                {analysis.detailedRoadmap ? (
                  <div className="grid gap-4">
                    {analysis.detailedRoadmap.immediate.map((item, index) => (
                      <div key={index} className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{item.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.timeline}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.learningPath.slice(0, 2).map((step, index) => (
                      <div key={index} className="bg-primary/5 p-4 rounded-lg">
                        <h5 className="font-semibold">{step.skill}</h5>
                        <p className="text-sm text-muted-foreground">{step.action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Short-term Goals - Enhanced */}
              <div className="border-l-4 border-secondary pl-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Phase 2: Skill Development (3-12 Months)</span>
                </h3>
                
                {analysis.detailedRoadmap ? (
                  <div className="grid gap-4">
                    {analysis.detailedRoadmap.shortTerm.map((item, index) => (
                      <div key={index} className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{item.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.timeline}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.skillGaps.filter(gap => gap.priority === 'high').map((gap, index) => (
                      <div key={index} className="bg-secondary/5 p-4 rounded-lg">
                        <h5 className="font-semibold">{gap.skill}</h5>
                        <p className="text-sm text-muted-foreground">Target level: {gap.requiredLevel}/10</p>
                        <p className="text-xs text-muted-foreground">Est. time: {gap.developmentTime}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Long-term Vision - Enhanced */}
              <div className="border-l-4 border-accent pl-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🚀</span>
                  <span>Phase 3: Career Advancement (1-3 Years)</span>
                </h3>
                
                {analysis.detailedRoadmap ? (
                  <div className="grid gap-4">
                    {analysis.detailedRoadmap.longTerm.map((item, index) => (
                      <div key={index} className="bg-accent/5 p-4 rounded-lg border border-accent/20">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{item.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant={item.priority === 'Critical' ? 'destructive' : item.priority === 'High' ? 'default' : 'secondary'}>
                              {item.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.timeline}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysis.careerRecommendations.slice(0, 2).map((career, index) => (
                      <div key={index} className="bg-accent/5 p-4 rounded-lg">
                        <h5 className="font-semibold">{career.title}</h5>
                        <p className="text-sm text-muted-foreground">{career.description}</p>
                        <p className="text-xs text-muted-foreground">Transition time: {career.timeToTransition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Success Tips */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span>✨</span>
                  <span>Success Tips for Your Journey</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">📈 Track Progress</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Set monthly review checkpoints</li>
                      <li>• Document achievements and learnings</li>
                      <li>• Adjust timelines based on progress</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-secondary">🤝 Network Actively</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Connect with industry professionals</li>
                      <li>• Join relevant professional communities</li>
                      <li>• Seek mentorship and guidance</li>
                    </ul>
                  </div>
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