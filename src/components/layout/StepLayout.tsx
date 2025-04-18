
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReactNode, useEffect, useState } from "react";
import { getActiveEssay, getEssayData, saveEssayData, updateEssayStep, completeEssay } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { NoteSidebar } from "@/components/layout/NoteSidebar";
import { toast } from "sonner";

interface StepLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onSave?: (essayData: EssayData) => void;
  canProceed?: boolean;
  onComplete?: () => void;
}

export function StepLayout({
  children,
  step,
  totalSteps,
  onSave,
  canProceed = true,
  onComplete,
}: StepLayoutProps) {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load the active essay
  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (!activeEssayId) {
      // No active essay, redirect to homepage
      navigate("/");
      return;
    }

    const data = getEssayData(activeEssayId);
    if (!data) {
      // Essay not found, redirect to homepage
      navigate("/");
      return;
    }

    setEssayData(data);
    
    // Update the current step if needed
    if (data.essay.currentStep !== step) {
      updateEssayStep(activeEssayId, step);
    }
  }, [navigate, step]);

  const handleSave = () => {
    if (!essayData) return;
    
    setIsSaving(true);
    
    try {
      // Call the custom onSave handler if provided
      if (onSave) {
        onSave(essayData);
      }
      
      // Save the data
      saveEssayData(essayData);
      
      // Show a brief "Saved" indication
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
    
    // Save current data before navigating
    handleSave();
    
    // Navigate to the target step
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
      // On the last step, call onComplete if provided
      if (onComplete) {
        onComplete();
      } else if (essayData) {
        // Default completion behavior
        completeEssay(essayData.essay.id);
        toast("Essay Completed!", {
          description: "Your essay has been marked as complete.",
        });
        navigate("/");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-green-100 py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-nunito font-bold text-slate-800">
          {essayData?.essay.title || "Essay"}
        </h1>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-slate-500">
            Step {step} of {totalSteps}
          </div>
          <div className="h-2 w-56 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow-md border border-green-50 p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Add the sidebar component */}
      <NoteSidebar essayData={essayData} />

      {/* Footer with navigation */}
      <footer className="bg-white shadow-sm border-t border-green-100 py-4 px-6 mt-auto">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Button variant="outline" onClick={goBack} className="space-x-1 border-green-200 hover:bg-green-50">
            <ArrowLeft className="w-4 h-4" />
            <span>{step > 1 ? "Previous" : "Exit"}</span>
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleSave} 
            disabled={isSaving}
            className="space-x-1 bg-green-100 hover:bg-green-200 text-green-800"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </Button>
          
          <Button 
            onClick={goNext} 
            disabled={!canProceed}
            className="space-x-1 bg-green-600 hover:bg-green-700"
          >
            <span>{step < totalSteps ? "Next" : "Complete"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
