import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReactNode, useEffect, useState } from "react";
import { getActiveEssay, getEssayData, saveEssayData, updateEssayStep, completeEssay } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { ArrowLeft, ArrowRight, Save, X, RefreshCw } from "lucide-react";
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
    
    if (data.essay.currentStep !== step) {
      updateEssayStep(activeEssayId, step);
    }
  }, [navigate, step]);

  const handleSave = () => {
    if (!essayData) return;
    
    setIsSaving(true);
    
    try {
      if (onSave) {
        onSave(essayData);
      }
      
      saveEssayData(essayData);
      
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    } catch (error) {
      console.error("Error saving:", error);
      setIsSaving(false);
    }
  };

  const goToStep = (targetStep: number) => {
    if (!essayData) return;
    
    handleSave();
    
    navigate(`/step${targetStep}`);
  };

  const goBack = () => {
    if (step > 1) {
      goToStep(step - 1);
    } else {
      navigate("/");
    }
  };

  const goNext = () => {
    if (!canProceed) return;
    
    if (step < totalSteps) {
      goToStep(step + 1);
    } else {
      if (onComplete) {
        onComplete();
      } else if (essayData) {
        completeEssay(essayData.essay.id);
        toast("Essay Completed!", {
          description: "Your essay has been marked as complete.",
        });
        navigate("/");
      }
    }
  };

  const handleExit = () => {
    setIsAlertOpen(true);
  };

  const handleExitConfirm = () => {
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

  const handleDiscard = () => {
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        window.location.reload();
      }
    }
  };

  const getPreviousButtonText = () => {
    if (step === 9) return "Refine More";
    if (step > 1) return "Previous";
    return "Exit";
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
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-slate-500">
            Step {step} of {totalSteps}
          </div>
          <div className="h-2 w-56 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
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

      <main className="flex-grow p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-md border border-blue-50 p-6 md:p-8">
          {children}
        </div>
      </main>

      <NoteSidebar essayData={essayData} />

      <footer className="bg-white shadow-sm border-t border-blue-100 py-4 px-6 mt-auto">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={goBack} 
            className="space-x-1 border-blue-200 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{getPreviousButtonText()}</span>
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleExit}
              className="space-x-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
              <span>Exit Without Saving</span>
            </Button>
            
            <Button 
              onClick={handleDiscard}
              variant="outline"
              className="space-x-1 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Discard Changes</span>
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={handleSave} 
              disabled={isSaving}
              className="space-x-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
          
          <Button 
            onClick={goNext} 
            disabled={!canProceed}
            className="space-x-1 bg-blue-600 hover:bg-blue-700"
          >
            <span>{step < totalSteps ? "Next" : "Complete"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit essay editing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exit? Your progress will be saved automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExitConfirm}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
