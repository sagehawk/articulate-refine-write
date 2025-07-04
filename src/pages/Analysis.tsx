
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Edit, PenTool, Loader } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData } from "@/utils/localStorage";
import { analyzeEssay, AnalysisResult } from "@/services/aiAnalysis";
import { toast } from "sonner";

const Analysis = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    performAnalysis(data);
  }, [navigate]);

  const performAnalysis = async (data: EssayData) => {
    setIsAnalyzing(true);
    
    // Combine all essay content
    let essayText = data.essay.title + "\n\n";
    
    // Add topics and paragraphs
    data.topics.forEach((topic, index) => {
      essayText += topic + "\n";
      if (data.paragraphs[index] && Array.isArray(data.paragraphs[index])) {
        data.paragraphs[index].forEach((paragraph: string) => {
          essayText += paragraph + "\n\n";
        });
      }
    });

    try {
      const result = await analyzeEssay(essayText);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast("Analysis failed. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToEditor = () => {
    navigate("/editor");
  };

  const handleNewEssay = () => {
    navigate("/");
  };

  const handleDownloadPDF = () => {
    // This would implement PDF generation
    toast("PDF download will be available soon!");
  };

  if (!essayData) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Essay Analysis</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadPDF}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            onClick={handleBackToEditor}
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Essay
          </Button>
          
          <Button
            onClick={handleNewEssay}
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted"
          >
            <PenTool className="w-4 h-4 mr-2" />
            New Essay
          </Button>
          
          <ThemeToggle />
        </div>
      </header>

      <main className="p-6">
        {isAnalyzing ? (
          <div className="text-center py-16">
            <Loader className="h-10 w-10 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Analyzing your essay...</p>
          </div>
        ) : analysis ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Overall Score</h2>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-primary">{analysis.overallScore}</div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Based on clarity, consistency, and logical soundness.</p>
                  <Progress value={analysis.overallScore} className="h-2" />
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Clarity</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">{analysis.clarityScore}</div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{analysis.clarityComment}</p>
                  <Progress value={analysis.clarityScore} className="h-2" />
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Consistency</h2>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-primary">{analysis.consistencyScore}</div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{analysis.consistencyComment}</p>
                  <Progress value={analysis.consistencyScore} className="h-2" />
                </div>
              </div>
            </section>

            {analysis.logicalFallacies.length > 0 && (
              <section className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Logical Fallacies</h2>
                <ul className="space-y-3">
                  {analysis.logicalFallacies.map((fallacy, index) => (
                    <li key={index} className="border border-border rounded-md p-3">
                      <p className="font-medium text-foreground">{fallacy.fallacyName}</p>
                      <p className="text-sm text-muted-foreground">
                        Offending Sentence: "{fallacy.offendingSentence}"
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-muted-foreground">No analysis available</h2>
            <p className="text-muted-foreground">Write your essay to see the analysis here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analysis;
