import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CareerAnalysis, CareerRecommendation, PersonalityTrait, SkillDetail } from "@/services/geminiService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import { CheckCircle, Clock, TrendingUp, Award, Zap, Lightbulb, ArrowRight, BookOpen, Users, Briefcase, Star, BarChart2, BarChart as BarChartIcon, PieChart, Target, Activity, AlertTriangle, CheckCircle2, Download, RefreshCw, Scale, DollarSign, FileText, Maximize2, Minimize2, Share2, Printer } from 'lucide-react';
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define types for learning path items
interface LearningPathItem {
  skill: string;
  action: string;
  timeline: string;
  difficultyLevel?: string;
  measurableOutcome?: string;
  prerequisites?: string;
  resources?: string[];
}

interface ResultsDisplayProps {
  analysis: CareerAnalysis;
  userName: string;
  onRestart: () => void;
}

export const ResultsDisplay = ({ analysis, userName, onRestart }: ResultsDisplayProps) => {
  const [isSummarizedView, setIsSummarizedView] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const getSkillColor = (score: number) => {
    if (score >= 8) return "bg-primary";
    if (score >= 6) return "bg-secondary";
    if (score >= 4) return "bg-warning";
    return "bg-destructive";
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-amber-600";
    return "text-gray-600";
  };

  // Calculate overall score
  const overallScore = Math.min(100, Math.max(0, analysis.overallScore || 0));
  const scoreColor = overallScore >= 85 ? 'text-green-500' : 
                    overallScore >= 70 ? 'text-blue-500' : 
                    overallScore >= 50 ? 'text-amber-500' : 'text-rose-500';

  // Enhanced personality insights
  const topPersonalityTraits = [...(analysis.personalityProfile || [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Enhanced career recommendations with match score
  const enhancedCareerRecommendations = [...(analysis.careerRecommendations || [])]
    .sort((a, b) => (b.matchScore || b.match || 0) - (a.matchScore || a.match || 0))
    .slice(0, 5);

  // Skill distribution data
  const skillDistribution = (analysis.skillGaps || []).map(gap => ({
    name: gap.skill.length > 15 ? gap.skill.substring(0, 15) + '...' : gap.skill,
    current: gap.currentLevel * 10,
    required: gap.requiredLevel * 10,
    gap: (gap.requiredLevel - gap.currentLevel) * 10,
    priority: gap.priority
  }));

  // Generate summarized view content
  const generateSummary = () => {
    const topCareer = enhancedCareerRecommendations[0];
    const topGaps = (analysis.skillGaps || [])
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3);
    
    return {
      overallScore,
      topStrengths: analysis.topStrengths?.slice(0, 3) || [],
      topCareer: topCareer ? {
        title: topCareer.title,
        matchScore: topCareer.matchScore || topCareer.match || 0,
        salaryRange: topCareer.salaryRange,
        growthProspects: topCareer.growthProspects || topCareer.growthOutlook
      } : null,
      topGaps,
      topPersonalityTraits: topPersonalityTraits.slice(0, 3),
      marketInsights: analysis.marketInsights
    };
  };

  const summary = generateSummary();

  // PDF Export Function
  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, 0, imgScaledWidth, imgScaledHeight);
      
      // Add additional pages if content is taller than one page
      let heightLeft = imgHeight * ratio;
      let position = 0;
      while (heightLeft >= pdfHeight) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, imgScaledWidth, imgHeight * ratio);
        heightLeft -= pdfHeight;
      }

      pdf.save(`${userName}_Career_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Print Function
  const handlePrint = () => {
    window.print();
  };

  // Share Function
  const handleShare = async () => {
    const summaryText = `🎯 Career Analysis Summary for ${userName}\n\n` +
      `Overall Score: ${overallScore}%\n` +
      `Top Career Match: ${summary.topCareer?.title || 'N/A'} (${summary.topCareer?.matchScore || 0}%)\n` +
      `Top Strengths: ${summary.topStrengths.join(', ')}\n` +
      `Generated on ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}'s Career Analysis`,
          text: summaryText,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(summaryText);
      alert('Summary copied to clipboard!');
    }
  };

  // Summarized View Component
  const SummarizedView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header Summary */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {overallScore}
            </span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {userName}'s Career Analysis Summary
          </CardTitle>
          <CardDescription className="text-base">
            Key insights at a glance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{overallScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Career Match</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-green-500">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{summary.topStrengths.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Top Strengths</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Career Match */}
      {summary.topCareer && (
        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Top Career Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{summary.topCareer.title}</h3>
                <Badge className={cn("text-lg px-3 py-1", getMatchScoreColor(summary.topCareer.matchScore))}>
                  {summary.topCareer.matchScore}% Match
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span>{summary.topCareer.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>{summary.topCareer.growthProspects}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Top Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {summary.topStrengths.map((strength, i) => (
              <Badge key={i} variant="secondary" className="text-sm py-1.5 px-3">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {strength}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Skill Gaps */}
      {summary.topGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Priority Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topGaps.map((gap, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{gap.skill}</span>
                  <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}>
                    {gap.priority}
                  </Badge>
                </div>
                <Progress value={(gap.currentLevel / gap.requiredLevel) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{gap.currentLevel}/{gap.requiredLevel}</span>
                  <span>{gap.developmentTime}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Personality Traits */}
      {summary.topPersonalityTraits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Top Personality Traits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topPersonalityTraits.map((trait, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{trait.trait}</span>
                  <span className="text-muted-foreground">{trait.score}/100</span>
                </div>
                <Progress value={trait.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      {summary.marketInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Demand Level: </span>
                <Badge variant="outline">{summary.marketInsights.demandLevel}</Badge>
              </div>
              {summary.marketInsights.trendingSkills && summary.marketInsights.trendingSkills.length > 0 && (
                <div>
                  <span className="font-medium">Trending Skills: </span>
                  <span className="text-muted-foreground">
                    {summary.marketInsights.trendingSkills.slice(0, 3).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" ref={contentRef}>
      {/* Enhanced Header with Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {overallScore}
            </span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {userName}'s Career Analysis
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your personalized career roadmap with AI-powered insights and actionable recommendations
        </p>
        
        {/* Action Buttons Row */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={onRestart}
          >
            <RefreshCw className="h-4 w-4" />
            Retake Assessment
          </Button>
          
          <Button 
            variant={isSummarizedView ? "default" : "outline"}
            className="gap-2"
            onClick={() => setIsSummarizedView(!isSummarizedView)}
          >
            {isSummarizedView ? (
              <>
                <Maximize2 className="h-4 w-4" />
                Full View
              </>
            ) : (
              <>
                <Minimize2 className="h-4 w-4" />
                Summary View
              </>
            )}
          </Button>
          
          <Button 
            className="gap-2"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            className="gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          
          <Button 
            variant="outline"
            className="gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Content: Summarized or Full View */}
      {isSummarizedView ? (
        <SummarizedView />
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Career Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallScore}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallScore >= 85 ? 'Excellent fit' : overallScore >= 70 ? 'Good fit' : 'Consider alternatives'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analysis.topStrengths?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.topStrengths?.slice(0, 2).join(', ')}...
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Market Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold capitalize">
                  {analysis.marketInsights?.demandLevel || 'Moderate'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.marketInsights?.trendingSkills?.slice(0, 2).join(', ')}...
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Time to Proficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-sm">
                  {analysis.skillGaps?.[0]?.developmentTime || '3-6 months'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  For key skills development
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full space-y-6">
            <div className="border-b">
              <TabsList className="w-full justify-start overflow-x-auto py-0">
                <TabsTrigger value="overview" className="py-4 px-6">
                  <BarChartIcon className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="careers" className="py-4 px-6">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Career Paths
                  <Badge variant="secondary" className="ml-2">
                    {analysis.careerRecommendations?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="skills" className="py-4 px-6">
                  <Zap className="w-4 h-4 mr-2" />
                  Skills Analysis
                  <Badge variant="secondary" className="ml-2">
                    {analysis.skillGaps?.length || 0}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="personality" className="py-4 px-6">
                  <Users className="w-4 h-4 mr-2" />
                  Personality
                  {topPersonalityTraits.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {topPersonalityTraits.length} Traits
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="roadmap" className="py-4 px-6">
                  <Target className="w-4 h-4 mr-2" />
                  Learning Path
                </TabsTrigger>
                <TabsTrigger value="insights" className="py-4 px-6">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  AI Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Insights */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Key Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Strengths to Leverage</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.topStrengths?.slice(0, 4).map((strength, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-100 dark:border-green-900">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium text-green-800 dark:text-green-200">{strength}</h4>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                {strength.toLowerCase().includes('leadership') ? 'Consider management roles' :
                                 strength.toLowerCase().includes('technical') ? 'Technical roles would be ideal' :
                                 'This is a valuable asset in many roles'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Development Areas</h3>
                      <div className="space-y-3">
                        {analysis.skillGaps?.slice(0, 3).map((gap, i) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{gap.skill}</span>
                              <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}>
                                {gap.priority} priority
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className={cn("h-2.5 rounded-full transition-all",
                                    gap.priority === 'high' ? 'bg-red-500' : 
                                    gap.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                  )} 
                                  style={{ width: `${Math.min(100, (gap.currentLevel / gap.requiredLevel) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {gap.currentLevel}/{gap.requiredLevel}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personality Snapshot */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Personality Snapshot
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topPersonalityTraits.map((trait, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{trait.trait}</span>
                              <span className="text-muted-foreground">{trait.score}/100</span>
                            </div>
                            <Progress value={trait.score} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5 text-blue-500" />
                        Skills Radar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                      {skillDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillDistribution}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar 
                              name="Current Level" 
                              dataKey="current" 
                              stroke="#3b82f6" 
                              fill="#3b82f6" 
                              fillOpacity={0.6} 
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          No skill data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Career Recommendations Tab */}
            <TabsContent value="careers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enhancedCareerRecommendations.map((career, index) => {
                  const matchScore = career.matchScore || career.match || 0;
                  const matchColorClass = matchScore >= 85 ? 'text-green-600' : 
                                       matchScore >= 70 ? 'text-blue-600' : 
                                       matchScore >= 50 ? 'text-amber-600' : 'text-gray-600';
                  
                  return (
                    <Card key={index} className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-t-4 border-primary/20 hover:border-primary/50">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{career.title}</h3>
                            <p className="text-sm text-muted-foreground">{career.field}</p>
                          </div>
                          <div className="text-right">
                            <div className={cn("text-2xl font-bold", matchColorClass)}>
                              {matchScore}%
                            </div>
                            <p className="text-xs text-muted-foreground">Match Score</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {career.description}
                        </p>
                        
                        <div className="space-y-3 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Salary:</span>
                            <span className="text-foreground">{career.salaryRange}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Growth:</span>
                            <span className="text-foreground">{career.growthProspects || career.growthOutlook}</span>
                          </div>
                          {career.timeToTransition && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <span className="font-medium">Transition:</span>
                              <span className="text-foreground">{career.timeToTransition}</span>
                            </div>
                          )}
                        </div>
                        
                        {career.requiredSkills && career.requiredSkills.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Key Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {(Array.isArray(career.requiredSkills) ? career.requiredSkills.slice(0, 5) : []).map((skill, skillIndex) => (
                                <Badge 
                                  key={skillIndex} 
                                  variant="secondary" 
                                  className="text-xs py-1 px-2 font-normal"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {career.requiredSkills.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{career.requiredSkills.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            Learn More
                          </Button>
                          <Button size="sm" className="gap-1.5">
                            View Roadmap
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Skills Analysis Tab */}
            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Skills Radar Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Skills Assessment
                    </CardTitle>
                    <CardDescription>
                      Your current skill levels compared to industry requirements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    {skillDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillDistribution}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar 
                            name="Current Level" 
                            dataKey="current" 
                            stroke="#3b82f6" 
                            fill="#3b82f6" 
                            fillOpacity={0.2} 
                          />
                          <Radar 
                            name="Required Level" 
                            dataKey="required" 
                            stroke="#10b981" 
                            fill="#10b981" 
                            fillOpacity={0.1} 
                            strokeDasharray="5 5"
                          />
                          <Tooltip 
                            formatter={(value, name) => [value, name === 'current' ? 'Current Level' : 'Required Level']}
                            labelFormatter={(label) => `Skill: ${label}`}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No skill gap data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skill Gaps Summary */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Priority Skill Gaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.skillGaps
                        ?.sort((a, b) => {
                          const priorityOrder = { high: 3, medium: 2, low: 1 };
                          return priorityOrder[b.priority] - priorityOrder[a.priority];
                        })
                        .slice(0, 3)
                        .map((gap, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-sm">{gap.skill}</span>
                              <Badge 
                                variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'default' : 'secondary'}
                                className="uppercase text-xs"
                              >
                                {gap.priority} priority
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className={cn("h-2 rounded-full",
                                    gap.priority === 'high' ? 'bg-red-500' : 
                                    gap.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                                  )} 
                                  style={{ width: `${Math.min(100, (gap.currentLevel / gap.requiredLevel) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {gap.currentLevel}/{gap.requiredLevel}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <Clock className="inline w-3 h-3 mr-1" />
                              {gap.developmentTime} to improve
                            </p>
                          </div>
                        ))}
                      {(!analysis.skillGaps || analysis.skillGaps.length === 0) && (
                        <div className="text-center text-muted-foreground text-sm py-4">
                          No skill gaps identified
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-green-500" />
                        Strongest Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.topStrengths?.slice(0, 3).map((skill, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-green-800 dark:text-green-200">{skill}</h4>
                          </div>
                        </div>
                      ))}
                      {(!analysis.topStrengths || analysis.topStrengths.length === 0) && (
                        <div className="text-center text-muted-foreground text-sm py-4">
                          No strengths identified
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Personality Profile
                  </CardTitle>
                  <CardDescription>
                    Your personality traits and their career implications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analysis.personalityProfile?.map((trait, index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">{trait.trait}</h3>
                          <Badge variant="secondary" className="text-lg px-3">
                            {trait.score}/100
                          </Badge>
                        </div>
                        <Progress value={trait.score} className="h-3" />
                        <p className="text-sm text-muted-foreground">{trait.description}</p>
                        {trait.careerImplications && (
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Career Implications:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {Array.isArray(trait.careerImplications) ? (
                                trait.careerImplications.map((impl, i) => (
                                  <li key={i}>• {impl}</li>
                                ))
                              ) : (
                                <li>• {trait.careerImplications}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!analysis.personalityProfile || analysis.personalityProfile.length === 0) && (
                      <div className="text-center text-muted-foreground py-8">
                        No personality profile data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Path Tab */}
            <TabsContent value="roadmap" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    Personalized Learning Path
                    <Badge variant="outline" className="text-xs">
                      AI-Generated
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    A step-by-step guide to close your skill gaps and advance your career
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.learningPath && analysis.learningPath.length > 0 ? (
                    <div className="space-y-8">
                      {(Array.isArray(analysis.learningPath) ? analysis.learningPath : []).map((item: LearningPathItem, index: number) => (
                        <Card key={index} className="border-l-4 border-primary">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                  {index + 1}
                                </div>
                                <CardTitle>{item.skill}</CardTitle>
                              </div>
                              {item.difficultyLevel && (
                                <Badge variant="outline">{item.difficultyLevel}</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Action Plan</h5>
                              <p className="text-sm text-muted-foreground">{item.action}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Timeline</h5>
                                <p className="text-sm text-muted-foreground">{item.timeline}</p>
                              </div>
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Expected Outcome</h5>
                                <p className="text-sm text-muted-foreground">{item.measurableOutcome}</p>
                              </div>
                            </div>
                            {item.resources && item.resources.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-sm mb-2">Resources</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {item.resources.map((resource, resIndex) => (
                                    <li key={resIndex}>{resource}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.prerequisites && (
                              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                                <h5 className="font-semibold text-sm mb-1">Prerequisites</h5>
                                <p className="text-sm text-muted-foreground">{item.prerequisites}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No learning path data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-500" />
                      Market Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.marketInsights ? (
                      <>
                        <div>
                          <span className="font-medium">Demand Level: </span>
                          <Badge variant="outline">{analysis.marketInsights.demandLevel}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">Competition: </span>
                          <Badge variant="outline">{analysis.marketInsights.competitionLevel}</Badge>
                        </div>
                        {analysis.marketInsights.trendingSkills && analysis.marketInsights.trendingSkills.length > 0 && (
                          <div>
                            <span className="font-medium">Trending Skills: </span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {analysis.marketInsights.trendingSkills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground text-sm">No market insights available</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-500" />
                      Development Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.developmentPlan ? (
                      <>
                        {analysis.developmentPlan.immediate && analysis.developmentPlan.immediate.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Immediate Actions</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.developmentPlan.immediate.map((action, i) => (
                                <li key={i}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.developmentPlan.shortTerm && analysis.developmentPlan.shortTerm.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Short-term Goals</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.developmentPlan.shortTerm.map((goal, i) => (
                                <li key={i}>• {goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.developmentPlan.longTerm && analysis.developmentPlan.longTerm.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Long-term Goals</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {analysis.developmentPlan.longTerm.map((goal, i) => (
                                <li key={i}>• {goal}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground text-sm">No development plan available</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
