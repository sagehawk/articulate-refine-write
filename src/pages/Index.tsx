
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createNewEssay, clearActiveEssay } from "@/utils/localStorage";
import { PenTool, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const navigate = useNavigate();
  
  const handleStartNewEssay = () => {
    const newEssay = createNewEssay("New Essay");
    navigate("/topics");
  };

  const handleViewEssays = () => {
    navigate("/library");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-12 max-w-md">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Write Better
            </h1>
            <p className="text-muted-foreground text-lg">
              Transform your ideas into compelling essays
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleStartNewEssay}
              size="lg"
              className="w-full h-14 text-lg font-medium"
            >
              <PenTool className="w-5 h-5 mr-2" />
              Create New Essay
            </Button>
            
            <Button 
              onClick={handleViewEssays}
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg font-medium"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              View Essays
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
