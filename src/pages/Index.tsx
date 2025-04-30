
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EssayList } from "@/components/EssayList";
import { getDraftEssays, getCompletedEssays, createNewEssay, clearActiveEssay } from "@/utils/localStorage";
import { FilePlus, BookOpen, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [draftEssays, setDraftEssays] = useState([]);
  const [completedEssays, setCompletedEssays] = useState([]);
  
  useEffect(() => {
    loadEssays();
    clearActiveEssay();
  }, []);
  
  const loadEssays = () => {
    setDraftEssays(getDraftEssays());
    setCompletedEssays(getCompletedEssays());
  };
  
  const handleStartNewEssay = () => {
    const newEssay = createNewEssay("Untitled Essay");
    navigate("/step1");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white shadow-sm py-6 px-6 mb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-nunito font-bold text-slate-800">
                  Articulate & Refine
                </h1>
              </div>
            </div>
            <Button 
              onClick={handleStartNewEssay} 
              size="lg"
              className="font-medium space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <FilePlus className="w-5 h-5" />
              <span>Start New Essay</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800">Write Better, Think Better</CardTitle>
              <CardDescription className="text-blue-700">
                Follow Jordan B. Peterson's step-by-step method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-6">
                This interactive guide will walk you through a structured
                process to articulate your ideas clearly and refine your
                writing through multiple drafts.
              </p>
              <Button 
                onClick={handleStartNewEssay} 
                className="font-medium space-x-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                <FilePlus className="w-5 h-5" />
                <span>Start New Essay</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peterson's Method</CardTitle>
              <CardDescription>
                A nine-step approach to essay writing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">1</span>
                  <span>Introduction & Setup</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">2</span>
                  <span>Levels of Resolution</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">3</span>
                  <span>Topic & Reading List</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">4</span>
                  <span>Outline Creation</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">5</span>
                  <span>Paragraph Drafting</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">6</span>
                  <span>Sentence Editing & Refinement</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">7</span>
                  <span>Paragraph Reordering</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">8</span>
                  <span>Generate New Outline & Restructure</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2">9</span>
                  <span>References & Formatting</span>
                </li>
              </ul>
            </CardContent>
          </Card>
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
