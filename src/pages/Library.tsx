
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAllEssays, deleteEssay, setActiveEssay, getEssayData } from "@/utils/localStorage";
import { ArrowLeft, BookOpen, Trash2, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Essay, EssayData } from "@/types/essay";

interface EnrichedEssay extends Essay {
  wordCount: number;
  status: string;
  snippet: string;
}

const Library = () => {
  const navigate = useNavigate();
  const [essays, setEssays] = useState<EnrichedEssay[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    loadEssays();
  }, []);

  const loadEssays = () => {
    const essayList = getAllEssays();
    const enrichedEssays = essayList.map(essay => {
      const essayData = getEssayData(essay.id);
      return {
        ...essay,
        wordCount: calculateWordCount(essayData),
        status: essay.isCompleted ? 'Completed' : 'Draft',
        snippet: getContentSnippet(essayData)
      };
    });
    setEssays(enrichedEssays);
  };

  const calculateWordCount = (essayData: EssayData | null) => {
    if (!essayData) return 0;
    let wordCount = 0;
    
    // Count words in paragraphs
    if (essayData.paragraphs && typeof essayData.paragraphs === 'object') {
      Object.values(essayData.paragraphs).forEach(paragraphArray => {
        if (Array.isArray(paragraphArray)) {
          paragraphArray.forEach(paragraph => {
            if (typeof paragraph === 'string') {
              wordCount += paragraph.split(/\s+/).filter(word => word.length > 0).length;
            }
          });
        }
      });
    }
    
    return wordCount;
  };

  const getContentSnippet = (essayData: EssayData | null) => {
    if (!essayData) return "No content yet";
    
    if (essayData.topics && Array.isArray(essayData.topics) && essayData.topics.length > 0) {
      const firstTopic = essayData.topics[0];
      if (essayData.paragraphs && typeof essayData.paragraphs === 'object') {
        const firstParagraphs = essayData.paragraphs[0];
        if (Array.isArray(firstParagraphs) && firstParagraphs.length > 0) {
          const firstSentence = firstParagraphs[0].split('.')[0];
          return `${firstSentence}...`;
        }
      }
      return `Topic: ${firstTopic.substring(0, 80)}...`;
    }
    
    return "No content yet";
  };

  const handleEditEssay = (essayId: string) => {
    setActiveEssay(essayId);
    navigate("/editor");
  };

  const handleDeleteEssay = (e: React.MouseEvent, essayId: string, title: string) => {
    e.stopPropagation(); // Prevent card click
    if (window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      deleteEssay(essayId);
      loadEssays();
    }
  };

  const handleCreateNew = () => {
    navigate("/");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/")}
                className="rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-bold text-foreground">My Essays</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreateNew}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Essay
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {essays.length === 0 ? (
          <div className="text-center py-20 space-y-8">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-foreground">No essays yet</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Start building your first argument with our structured approach to essay writing.
              </p>
            </div>
            <Button 
              onClick={handleCreateNew}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Essay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essays.map((essay) => (
              <div 
                key={essay.id}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer relative"
                onClick={() => handleEditEssay(essay.id)}
                onMouseEnter={() => setHoveredCard(essay.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight">
                      {essay.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(essay.lastUpdatedAt)}</span>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                      <span>{essay.wordCount} words</span>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        essay.status === 'Completed' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {essay.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Snippet */}
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-lora">
                    {essay.snippet}
                  </p>
                  
                  {/* Delete Button - Only shown on hover */}
                  {hoveredCard === essay.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteEssay(e, essay.id, essay.title)}
                      className="absolute top-4 right-4 h-8 w-8 hover:bg-destructive hover:text-destructive-foreground opacity-75 hover:opacity-100"
                      title="Delete Essay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Library;
