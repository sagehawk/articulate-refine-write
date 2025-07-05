
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Download, Edit, PenTool, Loader } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData } from "@/utils/localStorage";
import { analyzeEssayWithHighlights, AnalysisResult } from "@/services/aiAnalysis";
import { toast } from "sonner";

const Analysis = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<number | null>(null);
  const [essayText, setEssayText] = useState("");

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
    
    // Combine all essay content with proper formatting
    let fullEssayText = `${data.essay.title}\n\n`;
    
    // Add topics and paragraphs with proper structure
    data.topics.forEach((topic, index) => {
      fullEssayText += `${topic}\n\n`;
      if (data.paragraphs[index] && Array.isArray(data.paragraphs[index])) {
        data.paragraphs[index].forEach((paragraph: string) => {
          if (paragraph && paragraph.trim()) {
            fullEssayText += `${paragraph}\n\n`;
          }
        });
      }
    });

    setEssayText(fullEssayText);

    try {
      const result = await analyzeEssayWithHighlights(fullEssayText);
      setAnalysis(result);
      console.log('Analysis result:', result);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error("Analysis failed. Please try again later.");
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
    toast.info("PDF download will be available soon!");
  };

  const highlightText = (text: string, highlights: Array<{sentence: string, feedback: string, type: 'error' | 'warning' | 'suggestion'}>) => {
    if (!highlights || highlights.length === 0) return text;
    
    let highlightedText = text;
    highlights.forEach((highlight, index) => {
      const colorClass = highlight.type === 'error' ? 'bg-red-100 text-red-800 border-b-2 border-red-300 hover:bg-red-200' :
                        highlight.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-b-2 border-yellow-300 hover:bg-yellow-200' :
                        'bg-blue-100 text-blue-800 border-b-2 border-blue-300 hover:bg-blue-200';
      
      // Escape the sentence for regex to handle special characters
      const escapedSentence = highlight.sentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedSentence})`, 'gi');
      
      highlightedText = highlightedText.replace(
        regex,
        `<span class="cursor-pointer ${colorClass} transition-colors rounded px-1" data-highlight="${index}">$1</span>`
      );
    });
    
    return highlightedText;
  };

  const handleHighlightClick = (highlightIndex: number) => {
    setSelectedHighlight(selectedHighlight === highlightIndex ? null : highlightIndex);
  };

  if (!essayData) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Essay Analysis</h1>
            <p className="text-sm text-muted-foreground">{essayData.essay.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownloadPDF}
            className="bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            onClick={handleBackToEditor}
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted hidden sm:flex"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Essay
          </Button>
          
          <Button
            onClick={handleNewEssay}
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted"
          >
            <PenTool className="w-4 h-4 mr-2 sm:mr-2" />
            <span className="hidden sm:inline">New Essay</span>
          </Button>
          
          <ThemeToggle />
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {isAnalyzing ? (
          <div className="text-center py-16">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Analyzing your essay...</h2>
            <p className="text-lg text-muted-foreground">AI is reviewing your work for clarity, consistency, and logic</p>
          </div>
        ) : analysis ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Essay Text with Highlights */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Your Essay</h2>
              <div 
                className="prose prose-lg max-w-none text-foreground leading-relaxed font-lora"
                dangerouslySetInnerHTML={{ __html: highlightText(essayText, analysis.highlights || []) }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const highlightIndex = target.getAttribute('data-highlight');
                  if (highlightIndex !== null) {
                    handleHighlightClick(parseInt(highlightIndex));
                  }
                }}
              />
              
              {/* Floating feedback tooltip */}
              {selectedHighlight !== null && analysis.highlights && analysis.highlights[selectedHighlight] && (
                <div 
                  className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 max-w-sm"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      analysis.highlights[selectedHighlight].type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      analysis.highlights[selectedHighlight].type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {analysis.highlights[selectedHighlight].type.toUpperCase()}
                    </span>
                    <button 
                      onClick={() => setSelectedHighlight(null)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xl font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {analysis.highlights[selectedHighlight].feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            <div className="space-y-6">
              <section className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Overall Score</h2>
                <div className="flex items-center gap-6">
                  <div className="text-5xl sm:text-6xl font-bold text-primary">{analysis.overallScore}</div>
                  <div className="space-y-2 flex-1">
                    <p className="text-base text-muted-foreground">Based on clarity, consistency, and logical soundness.</p>
                    <Progress value={analysis.overallScore} className="h-3" />
                  </div>
                </div>
              </section>

              <section className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Clarity</h2>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-primary">{analysis.clarityScore}</div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-muted-foreground">{analysis.clarityComment}</p>
                    <Progress value={analysis.clarityScore} className="h-2" />
                  </div>
                </div>
              </section>

              <section className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Consistency</h2>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-primary">{analysis.consistencyScore}</div>
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-muted-foreground">{analysis.consistencyComment}</p>
                    <Progress value={analysis.consistencyScore} className="h-2" />
                  </div>
                </div>
              </section>

              {/* Feedback Items - Clickable */}
              {analysis.highlights && analysis.highlights.length > 0 && (
                <section className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Feedback Points</h2>
                  <ul className="space-y-3">
                    {analysis.highlights.map((highlight, index) => (
                      <li 
                        key={index} 
                        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                          highlight.type === 'error' ? 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-950' :
                          highlight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950' :
                          'border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950'
                        } ${selectedHighlight === index ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => handleHighlightClick(index)}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                            highlight.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            highlight.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {highlight.type.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm mb-2 line-clamp-2">
                              "{highlight.sentence}"
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {highlight.feedback}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {analysis.logicalFallacies && analysis.logicalFallacies.length > 0 && (
                <section className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Logical Fallacies</h2>
                  <ul className="space-y-3">
                    {analysis.logicalFallacies.map((fallacy, index) => (
                      <li key={index} className="border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 rounded-lg p-4">
                        <p className="font-semibold text-foreground text-red-800 dark:text-red-200 mb-2">{fallacy.fallacyName}</p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Found in:</strong> "{fallacy.offendingSentence}"
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No analysis available</h2>
            <p className="text-lg text-muted-foreground">Write your essay to see the analysis here.</p>
          </div>
        )}
      </main>

      {/* Overlay to close tooltip when clicking outside */}
      {selectedHighlight !== null && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setSelectedHighlight(null)}
        />
      )}
    </div>
  );
};

export default Analysis;
