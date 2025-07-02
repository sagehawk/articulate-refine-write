
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAllEssays, deleteEssay, setActiveEssay } from "@/utils/localStorage";
import { ArrowLeft, BookOpen, Trash2, Eye, Download } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Library = () => {
  const navigate = useNavigate();
  const [essays, setEssays] = useState([]);

  useEffect(() => {
    loadEssays();
  }, []);

  const loadEssays = () => {
    setEssays(getAllEssays());
  };

  const handleViewEssay = (essayId: string) => {
    setActiveEssay(essayId);
    navigate("/preview");
  };

  const handleDeleteEssay = (essayId: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      deleteEssay(essayId);
      loadEssays();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-6 border-b">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Essay Library</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="p-8">
        {essays.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No essays yet</h2>
            <p className="text-muted-foreground mb-6">Start writing your first essay</p>
            <Button onClick={() => navigate("/")}>Create New Essay</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essays.map((essay) => (
              <div key={essay.id} className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEssay(essay.id, essay.title)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{essay.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {formatDate(essay.lastUpdatedAt)}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEssay(essay.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEssay(essay.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
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
