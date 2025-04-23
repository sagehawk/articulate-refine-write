import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ReactNode, useEffect, useState, useCallback, useMemo } from "react";
import { getActiveEssay, getEssayData, saveEssayData, updateEssayStep, completeEssay } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  X, 
  FileText, 
  Edit, 
  RefreshCcw,
  ListChecks,
  PenLine,
  BookOpen,
  ArrowUpDown,
  Sparkles,
  BookCheck,
  Clock,
} from "lucide-react";
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
import { debounce } from "@/lib/utils";

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const [essayContent, setEssayContent] = useState("");
  const [showOriginalDraft, setShowOriginalDraft] = useState(false);
  const [originalDraft, setOriginalDraft] = useState("");
  const [activeIconSection, setActiveIconSection] = useState<number>(step);
  const [autosaveTimerId, setAutosaveTimerId] = useState<NodeJS.Timeout | null>(null);
  const [contentChanged, setContentChanged] = useState(false);

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
    
    if (data.step5 && data.step5.paragraphs) {
      const content = data.step5.paragraphs.join("\n\n");
      setEssayContent(content);
      setOriginalDraft(content);
    }
    
    if (data.essay.currentStep !== step) {
      updateEssayStep(activeEssayId, step);
    }
  }, [navigate, step]);

  useEffect(() => {
    const autoSaveInterval = 60000; // 1 minute
    
    if (autosaveTimerId) {
      clearInterval(autosaveTimerId);
    }
    
    const timerId = setInterval(() => {
      if (essayData && contentChanged) {
        handleSave();
        setContentChanged(false);
      }
    }, autoSaveInterval);
    
    setAutosaveTimerId(timerId);
    
    return () => {
      if (autosaveTimerId) {
        clearInterval(autosaveTimerId);
      }
    };
  }, [essayData, essayContent, contentChanged]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [essayData, essayContent]);

  const debouncedSave = useMemo(
    () => debounce(() => {
      if (essayData) {
        handleSave();
        setContentChanged(false);
      }
    }, 2000),
    [essayData, essayContent]
  );

  useEffect(() => {
    if (contentChanged) {
      debouncedSave();
    }
  }, [contentChanged, debouncedSave]);

  const handleSave = useCallback(() => {
    if (!essayData) return;
    
    setIsSaving(true);
    
    try {
      if (essayContent && essayData.step5) {
        essayData.step5.paragraphs = essayContent.split("\n\n").filter(p => p.trim() !== "");
      }
      
      if (onSave) {
        onSave(essayData);
      }
      
      saveEssayData(essayData);
      
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
    } catch (error) {
      console.error("Error saving:", error);
      setIsSaving(false);
      toast("Error saving essay", { 
        description: "Please try again" 
      });
    }
  }, [essayData, essayContent, onSave]);

  const goToStep = (targetStep: number) => {
    if (!essayData) return;
    
    handleSave();
    setActiveIconSection(targetStep);
    navigate(`/step${targetStep}`);
  };

  const handleEssayContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEssayContent(newContent);
    setContentChanged(true);
    
    if (essayData && essayData.step5) {
      const paragraphs = newContent.split("\n\n").filter(p => p.trim() !== "");
      essayData.step5.paragraphs = paragraphs;
    }
  };

  const handleDoOver = () => {
    if (window.confirm("Are you sure you want to restart? This will clear your current work.")) {
      setEssayContent("");
      setContentChanged(true);
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
      setContentChanged(true);
    } else {
      setEditableTitle(essayData?.essay.title || "");
      setIsEditing(false);
    }
  };
  
  const getFormattedSaveTime = () => {
    if (!lastSaved) return "";
    
    return lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-blue-100 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
          
          <div className="ml-2">
            {isSaving ? (
              <span className="text-slate-400 text-sm flex items-center">
                <RefreshCcw className="h-3 w-3 animate-spin mr-1" />
                Saving...
              </span>
            ) : lastSaved ? (
              <span className="text-slate-400 text-sm">
                Saved at {getFormattedSaveTime()}
              </span>
            ) : null}
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

      <main className="flex-grow flex">
        <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 1 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(1)}
            title="Goals & Setup"
          >
            <BookOpen className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 3 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(3)}
            title="Topic & Reading"
          >
            <BookCheck className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 4 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(4)}
            title="Outline"
          >
            <ListChecks className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 5 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(5)}
            title="Draft"
          >
            <PenLine className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 6 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(6)}
            title="Refine"
          >
            <Edit className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 7 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(7)}
            title="Reorder"
          >
            <ArrowUpDown className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 8 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(8)}
            title="Restructure"
          >
            <Sparkles className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className={`mb-4 ${activeIconSection === 9 ? 'bg-blue-100 text-blue-600' : 'text-slate-600'}`}
            onClick={() => goToStep(9)}
            title="Finalize"
          >
            <Clock className="h-5 w-5" />
          </Button>

          <div className="flex-grow"></div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 mb-4"
            onClick={toggleOriginalDraft}
            title={showOriginalDraft ? "Back to Current" : "View Original Draft"}
          >
            <FileText className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600 hover:text-green-600 hover:bg-green-50"
            onClick={handleSave}
            disabled={isSaving}
            title="Save Essay"
          >
            <Save className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="w-1/2 overflow-auto p-6 bg-white border-r border-slate-200">
          {children}
        </div>
        
        <div className="w-1/2 overflow-auto p-6 bg-slate-50">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Essay Content</h2>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDoOver}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <RefreshCcw className="h-4 w-4 mr-1" />
                Do Over
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          
          {showOriginalDraft ? (
            <div className="prose max-w-none">
              <h3 className="text-amber-600 mb-4">Original Draft</h3>
              <div className="whitespace-pre-wrap bg-amber-50 p-6 rounded-lg border border-amber-200">
                {originalDraft || "No original draft available."}
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <Textarea 
                value={essayContent}
                onChange={handleEssayContentChange}
                className="min-h-[calc(100vh-200px)] p-4 font-nunito text-base leading-relaxed"
                placeholder="Start writing your essay here..."
              />
            </div>
          )}
        </div>
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
