
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getActiveEssay, getEssayData, completeEssay } from "@/utils/localStorage";
import { ArrowLeft, Edit, Download, Home, Trophy, Star, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";

const Analysis = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState(null);
  const [selectedFallacy, setSelectedFallacy] = useState(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (!activeEssayId) {
      navigate("/");
      return;
    }

    const data = getEssayData(activeEssayId);
    if (!data) {
      navigate("/");
      return;
    }

    setEssayData(data);
    
    // Mark essay as completed
    if (!data.essay.isCompleted) {
      completeEssay(data.essay.id);
    }
  }, [navigate]);

  const renderEssay = () => {
    if (!essayData) return null;

    const essayContent = [];
    
    essayData.topics.forEach((topic, topicIndex) => {
      essayContent.push(
        <div key={`topic-${topicIndex}`} className="mb-8">
          <h2 className="text-h2 font-lora mb-4">{topic}</h2>
          {essayData.paragraphs[topicIndex]?.map((paragraph, paragraphIndex) => (
            <p key={`paragraph-${topicIndex}-${paragraphIndex}`} className="font-lora text-lg leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      );
    });

    return essayContent;
  };

  const mockAnalysis = {
    overallScore: 85,
    clarity: { score: 82, comment: "Generally clear with room for more precise language" },
    consistency: { score: 88, comment: "Arguments flow logically with strong connections" },
    fallacies: [
      { 
        type: "Hasty Generalization", 
        description: "Drawing broad conclusions from limited examples",
        sentence: "All students struggle with essay writing",
        explanation: "This statement is too broad and doesn't account for individual differences."
      },
      {
        type: "Appeal to Authority",
        description: "Relying too heavily on expert opinion without supporting evidence",
        sentence: "According to the professor, this is the best approach",
        explanation: "While expert opinion is valuable, it should be supported with additional evidence."
      }
    ]
  };

  if (!essayData) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Essay Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="container-essay py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/library")}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-h2 text-card-foreground">{essayData.essay.title}</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate("/editor")}
                  className="btn-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Essay
                </Button>
                <Button className="btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  onClick={() => navigate("/")}
                  className="btn-primary"
                >
                  <Home className="w-4 h-4 mr-2" />
                  New Essay
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="container-essay py-12">
          <article className="prose prose-lg max-w-none font-lora">
            {renderEssay()}
          </article>
        </main>
      </div>

      {/* Analysis Sidebar */}
      <div className="w-96 bg-card border-l border-border overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-h2 text-primary font-bold">{mockAnalysis.overallScore}/100</h2>
              <p className="text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Clarity & Conciseness */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-card-foreground">Clarity & Conciseness</h3>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                <span className="font-semibold">{mockAnalysis.clarity.score}</span>
              </div>
            </div>
            <Progress value={mockAnalysis.clarity.score} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {mockAnalysis.clarity.comment}
            </p>
          </div>

          {/* Logical Consistency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-card-foreground">Logical Consistency</h3>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                <span className="font-semibold">{mockAnalysis.consistency.score}</span>
              </div>
            </div>
            <Progress value={mockAnalysis.consistency.score} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {mockAnalysis.consistency.comment}
            </p>
          </div>

          {/* Logical Fallacies */}
          <div className="space-y-3">
            <h3 className="font-semibold text-card-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Logical Fallacies
            </h3>
            <div className="space-y-2">
              {mockAnalysis.fallacies.map((fallacy, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedFallacy === index 
                      ? 'bg-destructive/10 border-destructive/20' 
                      : 'bg-background border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedFallacy(selectedFallacy === index ? null : index)}
                >
                  <div className="font-medium text-sm text-destructive">{fallacy.type}</div>
                  <div className="text-xs text-muted-foreground mt-1">{fallacy.description}</div>
                  
                  {selectedFallacy === index && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <div className="text-sm">
                        <strong>Found in:</strong> "{fallacy.sentence}"
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {fallacy.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="font-semibold text-card-foreground">Recommendations</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <strong className="text-primary">Strengthen:</strong> Add more specific examples to support your arguments
              </div>
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                <strong className="text-accent">Consider:</strong> Addressing potential counterarguments
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border">
                <strong>Polish:</strong> Review transitions between paragraphs for smoother flow
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
