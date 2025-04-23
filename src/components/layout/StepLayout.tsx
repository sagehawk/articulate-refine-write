
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReactNode, useEffect, useState } from "react";
import { getActiveEssay, getEssayData, saveEssayData, updateEssayStep, completeEssay } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { ArrowLeft, ArrowRight, Save, X, FileText, Edit, RefreshCcw, ListChecks } from "lucide-react";
import { NoteSidebar } from "@/components/layout/NoteSidebar";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface StepLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onSave?: (essayData: EssayData) => void;
  canProceed?: boolean;
  onComplete?: () => void;
}

export function StepLayout({ children, step, totalSteps, onSave, canProceed = true, onComplete }: StepLayoutProps) {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const [essayContent, setEssayContent] = useState("");
  const [showOriginalDraft, setShowOriginalDraft] = useState(false);
  const [originalDraft, setOriginalDraft] = useState("");

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (!activeEssayId) {
      navigate("/");
      return;
    }

    const data = getEssayData(activeEssayId);
    if (!data) {
      navigate("/");
      return;
    }

    setEssayData(data);
    setEditableTitle(data.essay.title);
    
    // Get essay content if available
    if (data.step5 && data.step5.paragraphs) {
      const content = data.step5.paragraphs.join("\n\n");
      setEssayContent(content);
      setOriginalDraft(content); // Store original draft for comparison
    }
    
    if (data.essay.currentStep !== step) {
      updateEssayStep(activeEssayId, step);
    }
  }, [navigate, step]);

  const handleSave = () => {
    if (!essayData) return;
    
    setIsSaving(true);
    
    try {
      // Update essay content if it exists
      if (essayContent && essayData.step5) {
        essayData.step5.paragraphs = essayContent.split("\n\n").filter(p => p.trim() !== "");
      }
      
      if (onSave) {
        onSave(essayData);
      }
      
      saveEssayData(essayData);
      
      setTimeout(() => {
        setIsSaving(false);
        toast("Essay saved successfully!");
      }, 500);
    } catch (error) {
      console.error("Error saving:", error);
      setIsSaving(false);
      toast("Error saving essay", { 
        description: "Please try again" 
      });
    }
  };

  const goToStep = (targetStep: number) => {
    if (!essayData) return;
    
    handleSave();
    
    navigate(`/step${targetStep}`);
  };

  const handleEssayContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayContent(e.target.value);
  };

  const handleDoOver = () => {
    if (window.confirm("Are you sure you want to restart? This will clear your current work.")) {
      setEssayContent("");
      toast("Essay reset", {
        description: "You can view the original draft by clicking the 'View Original' button"
      });
    }
  };

  const toggleOriginalDraft = () => {
    setShowOriginalDraft(!showOriginalDraft);
    if (!showOriginalDraft) {
      toast("Viewing original draft", {
        description: "Click 'Back to Current' to return to your work"
      });
    }
  };

  const handleExit = () => {
    setIsAlertOpen(true);
  };

  const handleExitConfirm = () => {
    navigate("/");
  };

  const handleExitWithSave = () => {
    handleSave();
    navigate("/");
  };

  const startTitleEdit = () => {
    setIsEditing(true);
  };

  const saveTitleEdit = () => {
    if (essayData && editableTitle.trim()) {
      essayData.essay.title = editableTitle;
      saveEssayData(essayData);
      setIsEditing(false);
      toast("Title updated", {
        description: "Your essay title has been updated."
      });
    } else {
      setEditableTitle(essayData?.essay.title || "");
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-100 py-4 px-6 flex items-center justify-between">
        {isEditing ? (
          <div className="flex-1 max-w-md">
            <Input
              value={editableTitle}
              onChange={(e) => setEditableTitle(e.target.value)}
              className="text-xl font-nunito font-bold"
              onBlur={saveTitleEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitleEdit();
              }}
              autoFocus
            />
          </div>
        ) : (
          <h1 
            className="text-2xl font-nunito font-bold text-slate-800 cursor-pointer hover:text-blue-700"
            onClick={startTitleEdit}
            title="Click to edit title"
          >
            {essayData?.essay.title || "Essay"}
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleExit}
          className="ml-4 text-slate-500 hover:text-red-500 hover:bg-red-50"
          title="Exit"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-grow flex">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          {/* Left side - Navigation panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-white border-r border-slate-200">
            <div className="p-4 h-full flex flex-col">
              <div className="space-y-3 flex-grow">
                <h2 className="font-semibold text-slate-700 mb-4">Essay Steps</h2>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 mb-2"
                  onClick={() => goToStep(1)}
                  data-active={step === 1}
                >
                  <ListChecks className="h-5 w-5" />
                  <span>Introduction</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 mb-2"
                  onClick={() => goToStep(3)}
                  data-active={step === 3}
                >
                  <FileText className="h-5 w-5" />
                  <span>Topic & Reading</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 mb-2"
                  onClick={() => goToStep(4)}
                  data-active={step === 4}
                >
                  <ListChecks className="h-5 w-5" />
                  <span>Outline</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 mb-2"
                  onClick={() => goToStep(5)}
                  data-active={step === 5}
                >
                  <Edit className="h-5 w-5" />
                  <span>Draft</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 mb-2"
                  onClick={() => goToStep(6)}
                  data-active={step === 6}
                >
                  <Edit className="h-5 w-5" />
                  <span>Refine</span>
                </Button>
              </div>
              
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 text-amber-600"
                  onClick={toggleOriginalDraft}
                >
                  <FileText className="h-5 w-5" />
                  <span>{showOriginalDraft ? "Back to Current" : "View Original"}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 text-red-600"
                  onClick={handleDoOver}
                >
                  <RefreshCcw className="h-5 w-5" />
                  <span>Do Over</span>
                </Button>
                
                <Button 
                  className="w-full justify-start gap-3 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-5 w-5" />
                  <span>{isSaving ? "Saving..." : "Save Essay"}</span>
                </Button>
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right side - Essay content */}
          <ResizablePanel defaultSize={80}>
            <div className="h-full flex flex-col p-6 overflow-auto">
              <div className="flex-grow">
                {/* Display either the current work or original draft */}
                {showOriginalDraft ? (
                  <div className="prose max-w-none">
                    <h2 className="text-amber-600 mb-4">Original Draft</h2>
                    <div className="whitespace-pre-wrap bg-amber-50 p-6 rounded-lg border border-amber-200">
                      {originalDraft || "No original draft available."}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Show step-specific content */}
                    <div className="mb-6">
                      {children}
                    </div>
                    
                    {/* Editable essay area */}
                    <div className="mt-6">
                      <h2 className="text-xl font-semibold mb-2">Essay Content</h2>
                      <Textarea 
                        value={essayContent}
                        onChange={handleEssayContentChange}
                        className="min-h-[400px] p-4 font-nunito text-base leading-relaxed"
                        placeholder="Start writing your essay here..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes before exiting?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save your changes before exiting?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleExitConfirm}>No, Exit</AlertDialogCancel>
            <AlertDialogAction onClick={handleExitWithSave}>
              Yes, Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
