
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createNewEssay, getAllEssays } from "@/utils/localStorage";
import { PenTool, Calendar, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  const [essays, setEssays] = useState([]);
  
  useEffect(() => {
    const allEssays = getAllEssays();
    setEssays(allEssays);
  }, []);

  const handleStartNewEssay = () => {
    createNewEssay("Untitled Essay");
    navigate("/editor");
  };

  const handleOpenEssay = (essayId: string) => {
    localStorage.setItem('activeEssayId', essayId);
    navigate("/editor");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'No date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'No date';
    }
  };

  const calculateWordCount = (essay: any) => {
    let totalWords = 0;
    
    // Count words in paragraphs
    if (essay.paragraphs) {
      Object.values(essay.paragraphs).forEach((paragraphs: any) => {
        if (Array.isArray(paragraphs)) {
          paragraphs.forEach((paragraph: string) => {
            if (paragraph && typeof paragraph === 'string') {
              const words = paragraph.trim().split(/\s+/).filter(word => word.length > 0);
              totalWords += words.length;
            }
          });
        }
      });
    }
    
    // Count words in sentences
    if (essay.sentences) {
      Object.values(essay.sentences).forEach((sentences: any) => {
        if (Array.isArray(sentences)) {
          sentences.forEach((sentence: string) => {
            if (sentence && typeof sentence === 'string') {
              const words = sentence.trim().split(/\s+/).filter(word => word.length > 0);
              totalWords += words.length;
            }
          });
        }
      });
    }
    
    return totalWords;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-start px-8 py-16">
        <div className="container-essay max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center space-y-8 mb-16">
            <div className="space-y-6 fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground">
                Build Your Argument
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The structured path to clear thinking and compelling writing
              </p>
            </div>
            
            <Button 
              onClick={handleStartNewEssay}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-16 px-12 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PenTool className="w-6 h-6 mr-3" />
              Create New Essay
            </Button>
          </div>

          {/* Essays Grid */}
          {essays.length > 0 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Your Essays</h2>
                <p className="text-lg text-muted-foreground">Continue working on your essays or start fresh</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {essays.map((essay) => (
                  <div
                    key={essay.id}
                    onClick={() => handleOpenEssay(essay.id)}
                    className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all duration-200 group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {essay.title}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          essay.isCompleted 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {essay.isCompleted ? 'Complete' : 'Draft'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(essay.updatedAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {calculateWordCount(essay)} words
                        </div>
                      </div>
                      
                      {essay.preview && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {essay.preview}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
