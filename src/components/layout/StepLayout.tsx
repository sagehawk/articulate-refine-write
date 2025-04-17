
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReactNode, useEffect, useState } from "react";
import { getActiveEssay, getEssayData, saveEssayData, updateEssayStep } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { NoteSidebar } from "@/components/layout/NoteSidebar";

interface StepLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  onSave?: (essayData: EssayData) => void;
  canProceed?: boolean;
}

export function StepLayout({
  children,
  step,
  totalSteps,
  onSave,
  canProceed = true,
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
      // On the last step, mark as complete and go to homepage
      if (essayData) {
        essayData.essay.isCompleted = true;
        saveEssayData(essayData);
      }
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-nunito font-bold text-slate-800">
          {essayData?.essay.title || "Essay"}
        </h1>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-slate-500">
            Step {step} of {totalSteps}
          </div>
          <div className="h-2 w-56 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Add the sidebar component */}
      <NoteSidebar essayData={essayData} />

      {/* Footer with navigation */}
      <footer className="bg-white shadow-sm py-4 px-6 mt-auto">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Button variant="outline" onClick={goBack} className="space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>{step > 1 ? "Previous" : "Exit"}</span>
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleSave} 
            disabled={isSaving}
            className="space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </Button>
          
          <Button 
            onClick={goNext} 
            disabled={!canProceed}
            className="space-x-1"
          >
            <span>{step < totalSteps ? "Next" : "Complete"}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
