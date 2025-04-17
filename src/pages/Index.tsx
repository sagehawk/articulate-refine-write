
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EssayList } from "@/components/EssayList";
import { getDraftEssays, getCompletedEssays, createNewEssay, clearActiveEssay } from "@/utils/localStorage";
import { FilePlus, BookOpen } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [draftEssays, setDraftEssays] = useState([]);
  const [completedEssays, setCompletedEssays] = useState([]);
  
  // Load essays on component mount
  useEffect(() => {
    loadEssays();
    // Clear any active essay when viewing the homepage
    clearActiveEssay();
  }, []);
  
  const loadEssays = () => {
    setDraftEssays(getDraftEssays());
    setCompletedEssays(getCompletedEssays());
  };
  
  const handleStartNewEssay = () => {
    // Clear any active essay and navigate to Step 1
    // We need to create a new essay first, then navigate
    const newEssay = createNewEssay("Untitled Essay");
    navigate("/step1");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-nunito font-bold text-slate-800">
                Articulate & Refine
              </h1>
            </div>
            <Button 
              onClick={handleStartNewEssay} 
              size="lg"
              className="font-medium space-x-2"
            >
              <FilePlus className="w-5 h-5" />
              <span>Start New Essay</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-2">Welcome to Articulate & Refine</h2>
          <p className="text-slate-600 mb-4 max-w-3xl">
            An interactive guide to writing powerful essays based on Jordan B. Peterson's Essay Writing Guide. 
            Work through a structured process to articulate your ideas clearly and refine your writing.
          </p>
          
          <Button 
            onClick={handleStartNewEssay} 
            className="font-medium space-x-2"
          >
            <FilePlus className="w-5 h-5" />
            <span>Start New Essay</span>
          </Button>
        </div>
        
        <EssayList
          essays={draftEssays}
          title="Draft Essays (In Progress)"
          icon="draft"
          onEssayDeleted={loadEssays}
        />
        
        <EssayList
          essays={completedEssays}
          title="Finished Essays"
          icon="completed"
          onEssayDeleted={loadEssays}
        />
      </main>
    </div>
  );
};

export default Index;
