
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAllEssays, deleteEssay, setActiveEssay, getEssayData } from "@/utils/localStorage";
import { ArrowLeft, BookOpen, Trash2, Eye, Download, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Library = () => {
  const navigate = useNavigate();
  const [essays, setEssays] = useState([]);

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

  const calculateWordCount = (essayData) => {
    if (!essayData) return 0;
    let wordCount = 0;
    
    // Count words in paragraphs
    Object.values(essayData.paragraphs || {}).forEach(paragraphArray => {
      paragraphArray.forEach(paragraph => {
        wordCount += paragraph.split(/\s+/).filter(word => word.length > 0).length;
      });
    });
    
    return wordCount;
  };

  const getContentSnippet = (essayData) => {
    if (!essayData) return "No content yet";
    
    if (essayData.topics && essayData.topics.length > 0) {
      const firstTopic = essayData.topics[0];
      const firstParagraphs = essayData.paragraphs?.[0];
      if (firstParagraphs && firstParagraphs.length > 0) {
        const firstSentence = firstParagraphs[0].split('.')[0];
        return `${firstSentence}...`;
      }
      return `Topic: ${firstTopic.substring(0, 80)}...`;
    }
    
    return "No content yet";
  };

  const handleViewEssay = (essayId) => {
    setActiveEssay(essayId);
    navigate("/analysis");
  };

  const handleEditEssay = (essayId) => {
    setActiveEssay(essayId);
    navigate("/editor");
  };

  const handleDeleteEssay = (essayId, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteEssay(essayId);
      loadEssays();
    }
  };

  const handleCreateNew = () => {
    navigate("/");
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-essay py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-h2 text-card-foreground">My Essays</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCreateNew}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Essay
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container-essay py-8">
        {essays.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-h2 text-foreground">No essays yet</h2>
              <p className="text-muted-foreground">Start building your first argument</p>
            </div>
            <Button 
              onClick={handleCreateNew}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Essay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {essays.map((essay) => (
              <div 
                key={essay.id} 
                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200 group fade-in"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {essay.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(essay.lastUpdatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewEssay(essay.id)}
                        className="h-8 w-8 hover:bg-muted"
                        title="View Essay"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewEssay(essay.id)}
                        className="h-8 w-8 hover:bg-muted"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEssay(essay.id, essay.title)}
                        className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                        title="Delete Essay"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      Word Count: <span className="font-medium">{essay.wordCount}</span>
                    </span>
                    <span>
                      Status: <span className={`font-medium ${essay.status === 'Completed' ? 'text-primary' : 'text-accent'}`}>
                        {essay.status}
                      </span>
                    </span>
                  </div>
                  
                  {/* Content Snippet */}
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {essay.snippet}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleEditEssay(essay.id)}
                      className="btn-secondary flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleViewEssay(essay.id)}
                      className="btn-primary flex-1"
                    >
                      View
                    </Button>
                  </div>
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
