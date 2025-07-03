
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllEssays, deleteEssay, setActiveEssay } from "@/utils/localStorage";
import { Essay } from "@/types/essay";
import { ArrowLeft, PenTool, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

const Library = () => {
  const navigate = useNavigate();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [hoveredEssayId, setHoveredEssayId] = useState<string | null>(null);

  useEffect(() => {
    loadEssays();
  }, []);

  const loadEssays = () => {
    const allEssays = getAllEssays();
    setEssays(allEssays);
  };

  const handleEssayClick = (essayId: string) => {
    setActiveEssay(essayId);
    navigate("/editor");
  };

  const handleDeleteEssay = (e: React.MouseEvent, essayId: string) => {
    e.stopPropagation(); // Prevent card click
    
    if (window.confirm("Are you sure you want to delete this essay?")) {
      deleteEssay(essayId);
      loadEssays();
      toast("Essay deleted successfully");
    }
  };

  const handleCreateNew = () => {
    navigate("/");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWordCount = (essay: Essay) => {
    // This is a simple estimation - in a real app you'd calculate from actual content
    return Math.floor(Math.random() * 1000) + 200; // Placeholder
  };

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
          <h1 className="text-2xl font-bold text-foreground">My Essays</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateNew}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <PenTool className="w-4 h-4 mr-2" />
            New Essay
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="p-6">
        {essays.length === 0 ? (
          <div className="text-center py-16">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">No essays yet</h2>
              <p className="text-muted-foreground">Start writing your first essay to see it here.</p>
              <Button 
                onClick={handleCreateNew}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Create Your First Essay
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {essays.map((essay) => (
              <Card 
                key={essay.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20 relative"
                onClick={() => handleEssayClick(essay.id)}
                onMouseEnter={() => setHoveredEssayId(essay.id)}
                onMouseLeave={() => setHoveredEssayId(null)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground">
                      {essay.title}
                    </h3>
                    {hoveredEssayId === essay.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={(e) => handleDeleteEssay(e, essay.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDate(essay.lastUpdatedAt)}</span>
                    <span>{getWordCount(essay)} words</span>
                    <Badge 
                      variant={essay.isCompleted ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {essay.isCompleted ? "Completed" : "Draft"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Library;
