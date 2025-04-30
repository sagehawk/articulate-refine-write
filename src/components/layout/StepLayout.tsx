
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
  Check,
  LogOut,
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
  disablePreviousSteps?: boolean;
}

export function StepLayout({ 
  children, 
  step, 
  totalSteps, 
  onSave, 
  canProceed = true, 
  onComplete,
  disablePreviousSteps = false 
}: StepLayoutProps) {
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
  const [syncingFromStepEdit, setSyncingFromStepEdit] = useState(false);
  const [bibliography, setBibliography] = useState("");
  const [navigateWarningOpen, setNavigateWarningOpen] = useState(false);
  const [navigateTarget, setNavigateTarget] = useState<string>("");
  
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
    
    if (data.step9 && data.step9.bibliography) {
      setBibliography(data.step9.bibliography);
    }
    
    if (data.essay.currentStep !== step) {
      updateEssayStep(activeEssayId, step);
    }
  }, [navigate, step]);

  useEffect(() => {
    if (essayData && essayData.step5 && !syncingFromStepEdit) {
      const newContent = essayData.step5.paragraphs.join("\n\n");
      if (newContent !== essayContent) {
        setEssayContent(newContent);
      }
    }
    
    if (essayData && essayData.step9 && !syncingFromStepEdit) {
      if (essayData.step9.bibliography !== bibliography) {
        setBibliography(essayData.step9.bibliography || "");
      }
    }
  }, [essayData]);

  // Listen for custom event to sync content across components
  useEffect(() => {
    const handleSyncEssayContent = (e: CustomEvent) => {
      const { paragraphs, bibliography: newBibliography } = e.detail;
      
      if (paragraphs) {
        const newContent = paragraphs.join("\n\n");
        setEssayContent(newContent);
      }
      
      if (newBibliography) {
        setBibliography(newBibliography);
      }
      
      // Update essayData if needed
      if (essayData) {
        if (paragraphs) {
          if (!essayData.step5) {
            essayData.step5 = { paragraphs: [] };
          }
          essayData.step5.paragraphs = paragraphs;
        }
        
        if (newBibliography) {
          if (!essayData.step9) {
            essayData.step9 = { 
              bibliography: newBibliography, 
              formattingChecks: {
                doubleSpaced: false,
                titlePage: false,
                citationsChecked: false
              }
            };
          } else {
            essayData.step9.bibliography = newBibliography;
          }
        }
        
        setEssayData({ ...essayData });
      }
    };

    window.addEventListener('syncEssayContent', handleSyncEssayContent as EventListener);
    
    return () => {
      window.removeEventListener('syncEssayContent', handleSyncEssayContent as EventListener);
    };
  }, [essayData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (contentChanged) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [contentChanged]);

  // Modify the autosave to only save on significant actions, not continuously
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
  }, [essayData, contentChanged]);

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
  }, [essayData, essayContent, bibliography]);

  const debouncedSave = useMemo(
    () => debounce(() => {
      if (essayData) {
        handleSave();
        setContentChanged(false);
      }
    }, 2000),
    [essayData, essayContent, bibliography]
  );

  useEffect(() => {
    if (contentChanged) {
      debouncedSave();
    }
  }, [contentChanged, debouncedSave]);
  
  const extractFirstSentences = (text: string): string[] => {
    const paragraphs = text.split("\n\n").filter(p => p.trim() !== "");
    
    return paragraphs.map(paragraph => {
      const match = paragraph.match(/^.+?[.!?](?:\s|$)/);
      if (match) {
        return match[0].trim();
      }
      return paragraph.length <= 50 ? paragraph.trim() : paragraph.substring(0, 50).trim() + "...";
    });
  };

  const handleSave = useCallback(() => {
    if (!essayData) return;
    
    setIsSaving(true);
    setSyncingFromStepEdit(true);
    
    try {
      if (essayContent) {
        const paragraphs = essayContent.split("\n\n").filter(p => p.trim() !== "");
        
        if (!essayData.step5) {
          essayData.step5 = { paragraphs: [] };
        }
        essayData.step5.paragraphs = paragraphs;
        
        const outlineSentences = extractFirstSentences(essayContent);
        
        if (!essayData.step4) {
          essayData.step4 = { outlineSentences: [] };
        }
        essayData.step4.outlineSentences = outlineSentences;
      }
      
      if (step === 9 && bibliography.trim()) {
        if (!essayData.step9) {
          essayData.step9 = {
            bibliography: bibliography,
            formattingChecks: {
              doubleSpaced: false,
              titlePage: false,
              citationsChecked: false
            }
          };
        } else {
          essayData.step9.bibliography = bibliography;
        }
      }
      
      if (onSave) {
        onSave(essayData);
      }
      
      saveEssayData(essayData);
      
      // Dispatch event to sync content across components
      if (window.parent) {
        const event = new CustomEvent('syncEssayContent', { 
          detail: { 
            paragraphs: essayData.step5?.paragraphs,
            bibliography: essayData.step9?.bibliography
          }
        });
        window.dispatchEvent(event);
      }
      
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
        setSyncingFromStepEdit(false);
      }, 500);
    } catch (error) {
      console.error("Error saving:", error);
      setIsSaving(false);
      setSyncingFromStepEdit(false);
      toast("Error saving essay");
    }
  }, [essayData, essayContent, onSave, step, bibliography]);

  const goToStep = (targetStep: number) => {
    if (!essayData) return;
    
    if (contentChanged) {
      // Save current step before navigating
      handleSave();
    }
    
    setActiveIconSection(targetStep);
    navigate(`/step${targetStep}`);
  };

  const handleEssayContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEssayContent(newContent);
    setContentChanged(true);
  };
  
  const handleEssayContentBlur = () => {
    if (contentChanged) {
      handleSave();
      setContentChanged(false);
    }
  };
  
  const handleBibliographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBibliography = e.target.value;
    setBibliography(newBibliography);
    setContentChanged(true);
  };
  
  const handleBibliographyBlur = () => {
    if (contentChanged) {
      handleSave();
      setContentChanged(false);
    }
  };

  const handleDoOver = () => {
    if (window.confirm("Are you sure you want to restart? This will save your current work as a draft and let you start fresh.")) {
      if (essayData && essayContent.trim()) {
        const draft = {
          content: essayContent,
          createdAt: new Date().getTime(),
          title: essayData.essay.title + " (Draft)"
        };
        
        const draftsKey = `essay_drafts_${essayData.essay.id}`;
        const existingDrafts = JSON.parse(localStorage.getItem(draftsKey) || "[]");
        localStorage.setItem(draftsKey, JSON.stringify([...existingDrafts, draft]));
        
        setEssayContent("");
        setContentChanged(true);
        
        toast("Draft saved", {
          description: "Your work has been saved as a draft. You can start fresh now."
        });
      }
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
    if (contentChanged) {
      setIsAlertOpen(true);
    } else {
      navigate("/");
    }
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
  
  const getFullEssayContent = () => {
    let content = essayContent;
    
    if (bibliography && bibliography.trim()) {
      content += "\n\nBibliography:\n" + bibliography;
    }
    
    return content;
  };
  
  const handleComplete = () => {
    if (!essayData) return;
    
    handleSave();
    
    if (onComplete) {
      onComplete();
    } else {
      const activeEssayId = getActiveEssay();
      if (activeEssayId) {
        completeEssay(activeEssayId);
        toast("Essay Completed!", {
          description: "Your essay has been marked as complete.",
        });
        navigate("/");
      }
    }
  };

  // Function to synchronize content from the steps to the essay content panel
  const syncContentFromSteps = useCallback(() => {
    if (!essayData) return;
    
    // This function will be called by step components when they update content
    // that should be reflected in the essay content panel
    if (essayData.step5?.paragraphs) {
      setEssayContent(essayData.step5.paragraphs.join("\n\n"));
    }
    
    if (step === 9 && essayData.step9?.bibliography) {
      setBibliography(essayData.step9.bibliography);
    }
  }, [essayData, step]);

  const shouldShowEssayContent = step >= 4; // Show essay content from step 4 onwards
  
  const isEssayContentReadOnly = step === 7;

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return "Goals & Setup";
      case 2: return "Resolution Levels";
      case 3: return "Topic & Reading";
      case 4: return "Outline";
      case 5: return "Draft";
      case 6: return "Refine";
      case 7: return "Reorder";
      case 8: return "Restructure";
      case 9: return "Finalize";
      default: return "";
    }
  };

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return <BookOpen className="h-5 w-5" />;
      case 2: return <FileText className="h-5 w-5" />;
      case 3: return <BookCheck className="h-5 w-5" />;
      case 4: return <ListChecks className="h-5 w-5" />;
      case 5: return <PenLine className="h-5 w-5" />;
      case 6: return <Edit className="h-5 w-5" />;
      case 7: return <ArrowUpDown className="h-5 w-5" />;
      case 8: return <Sparkles className="h-5 w-5" />;
      case 9: return <Clock className="h-5 w-5" />;
      default: return null;
    }
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNumber) => (
            <Button 
              key={stepNumber}
              variant="ghost" 
              size="icon" 
              className={`mb-4 ${
                activeIconSection === stepNumber ? 'bg-blue-100 text-blue-600' : 'text-slate-600'
              }`}
              onClick={() => {
                if (contentChanged) {
                  setNavigateTarget(`/step${stepNumber}`);
                  setNavigateWarningOpen(true);
                } else {
                  !disablePreviousSteps && goToStep(stepNumber);
                }
              }}
              disabled={disablePreviousSteps && stepNumber < step}
              title={getStepTitle(stepNumber)}
            >
              {getStepIcon(stepNumber)}
            </Button>
          ))}
          
          <div className="flex-grow"></div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
            onClick={handleExit}
            title="Exit"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        <div className={`w-${shouldShowEssayContent ? '1/2' : 'full'} overflow-auto p-6 bg-white border-r border-slate-200`}>
          {children}
        </div>
        
        {shouldShowEssayContent && (
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
                
                {step === 9 && (
                  <Button
                    size="sm"
                    onClick={handleComplete}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Complete Essay
                  </Button>
                )}
                
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
            
            {!showOriginalDraft ? (
              <div className="mt-2">
                <Textarea 
                  value={essayContent}
                  onChange={handleEssayContentChange}
                  onBlur={handleEssayContentBlur}
                  readOnly={isEssayContentReadOnly}
                  className={`min-h-[calc(100vh-280px)] p-4 font-nunito text-base leading-relaxed ${
                    isEssayContentReadOnly ? 'bg-slate-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={isEssayContentReadOnly ? "Content is read-only during paragraph reordering" : "Start writing your essay here..."}
                />
                
                {step === 9 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Bibliography</h3>
                    <Textarea
                      value={bibliography}
                      onChange={handleBibliographyChange}
                      onBlur={handleBibliographyBlur}
                      className="p-4 font-nunito text-base leading-relaxed min-h-[200px]"
                      placeholder="Add your bibliography here..."
                    />
                  </div>
                )}
                
              </div>
            ) : (
              <div className="prose max-w-none">
                <h3 className="text-amber-600 mb-4">Original Draft</h3>
                <div className="whitespace-pre-wrap bg-amber-50 p-6 rounded-lg border border-amber-200">
                  {originalDraft || "No original draft available."}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Alert Dialog for Exit Confirmation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to save your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose what you'd like to do with your changes before exiting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsAlertOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExitConfirm}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Don't Save
            </Button>
            <Button onClick={handleExitWithSave} className="bg-green-600 hover:bg-green-700">
              Save & Exit
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Alert Dialog for Navigation Warning */}
      <AlertDialog open={navigateWarningOpen} onOpenChange={setNavigateWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes before navigating?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Do you want to save them before going to the next step?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setNavigateWarningOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setNavigateWarningOpen(false);
                if (navigateTarget) {
                  navigate(navigateTarget);
                }
              }}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Don't Save
            </Button>
            <Button 
              onClick={() => {
                handleSave();
                setNavigateWarningOpen(false);
                if (navigateTarget) {
                  navigate(navigateTarget);
                }
              }} 
              className="bg-green-600 hover:bg-green-700"
            >
              Save & Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
