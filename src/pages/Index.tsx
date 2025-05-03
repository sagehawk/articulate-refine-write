
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EssayList } from "@/components/EssayList";
import { getDraftEssays, getCompletedEssays, createNewEssay, clearActiveEssay } from "@/utils/localStorage";
import { FilePlus, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="min-h-screen bg-slate-50 pb-12 dark:bg-slate-900">
      <header className="bg-white shadow-sm py-6 px-6 mb-8 dark:bg-slate-800 dark:shadow-slate-700/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3 dark:text-blue-400" />
                <h1 className="text-3xl font-nunito font-bold text-slate-800 dark:text-slate-100">
                  Articulate & Refine
                </h1>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <Card className="bg-gradient-to-br from-blue-50 to-slate-50 border-blue-100 dark:from-blue-900/20 dark:to-slate-800 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-300">Write Better, Think Better</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-400">
                Follow Jordan B. Peterson's step-by-step method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-6 dark:text-slate-300">
                This interactive guide will walk you through a structured
                process to articulate your ideas clearly and refine your
                writing through multiple drafts.
              </p>
              <Button 
                onClick={handleStartNewEssay} 
                className="font-medium space-x-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <FilePlus className="w-5 h-5" />
                <span>Start New Essay</span>
              </Button>
            </CardContent>
          </Card>

          <Card className="dark:border-slate-700 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">Peterson's Method</CardTitle>
              <CardDescription className="dark:text-slate-300">
                A nine-step approach to essay writing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">1</span>
                  <span className="dark:text-slate-300">Introduction & Setup</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">2</span>
                  <span className="dark:text-slate-300">Levels of Resolution</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">3</span>
                  <span className="dark:text-slate-300">Topic & Reading List</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">4</span>
                  <span className="dark:text-slate-300">Outline Creation</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">5</span>
                  <span className="dark:text-slate-300">Paragraph Drafting</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">6</span>
                  <span className="dark:text-slate-300">Sentence Editing & Refinement</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">7</span>
                  <span className="dark:text-slate-300">Paragraph Reordering</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">8</span>
                  <span className="dark:text-slate-300">Generate New Outline & Restructure</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mr-2 dark:bg-blue-900 dark:text-blue-200">9</span>
                  <span className="dark:text-slate-300">References & Formatting</span>
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
