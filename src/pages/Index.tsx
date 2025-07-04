
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createNewEssay, getActiveEssay, getEssayData, getAllEssays } from "@/utils/localStorage";
import { PenTool, BookOpen, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const [resumeEssay, setResumeEssay] = useState(null);
  
  useEffect(() => {
    // Check for unfinished essays
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      const essayData = getEssayData(activeEssayId);
      if (essayData && !essayData.essay.isCompleted) {
        setResumeEssay(essayData);
      }
    } else {
      // Check for most recent unfinished essay
      const essays = getAllEssays();
      const unfinishedEssay = essays.find(essay => !essay.isCompleted);
      if (unfinishedEssay) {
        const essayData = getEssayData(unfinishedEssay.id);
        if (essayData) {
          setResumeEssay(essayData);
        }
      }
    }
  }, []);

  const handleStartNewEssay = () => {
    createNewEssay("Untitled Essay");
    navigate("/editor");
  };

  const handleViewEssays = () => {
    navigate("/library");
  };

  const handleResumeEssay = () => {
    if (resumeEssay) {
      navigate("/editor");
    }
  };

  const getContentSnippet = (essayData) => {
    if (essayData.topics && essayData.topics.length > 0) {
      return `Starting with: "${essayData.topics[0]}"`;
    }
    return "No content yet";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="container-essay">
          <div className="text-center space-y-12">
            {/* Brand Header */}
            <div className="space-y-6 fade-in">
              <h1 className="text-h1 text-foreground">
                Essay Architect
              </h1>
              <div className="space-y-3">
                <h2 className="text-h2 text-foreground">
                  Build Your Argument
                </h2>
                <p className="text-body text-muted-foreground max-w-md mx-auto">
                  The structured path to clear thinking and compelling writing
                </p>
              </div>
            </div>
            
            {/* Resume Essay Card */}
            {resumeEssay && (
              <div className="bg-card border border-border rounded-lg p-6 space-y-4 slide-up">
                <h3 className="text-h3 text-foreground flex items-center gap-2">
                  <div className="w-1 h-6 bg-accent rounded-full"></div>
                  Continue where you left off?
                </h3>
                <div className="space-y-2">
                  <h4 className="font-semibold text-card-foreground">
                    {resumeEssay.essay.title}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {getContentSnippet(resumeEssay)}
                  </p>
                </div>
                <Button 
                  onClick={handleResumeEssay}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full h-12"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Resume Writing
                </Button>
              </div>
            )}
            
            {/* Main Actions */}
            <div className="space-y-4">
              <Button 
                onClick={handleStartNewEssay}
                variant={resumeEssay ? "outline" : "default"}
                className={resumeEssay 
                  ? "bg-transparent text-foreground border-border hover:bg-muted w-full h-14 text-lg font-medium"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground w-full h-14 text-lg font-medium"
                }
              >
                <PenTool className="w-5 h-5 mr-2" />
                Create New Essay
              </Button>
              
              <button 
                onClick={handleViewEssays}
                className="flex items-center justify-center gap-2 text-foreground hover:text-primary transition-colors text-lg font-medium p-2"
              >
                <BookOpen className="w-5 h-5" />
                My Essays
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
