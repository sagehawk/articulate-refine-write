import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Checkbox import removed as it's not used in the provided JSX
// import { Checkbox } from "@/components/ui/checkbox";
import { Check, Upload, RefreshCcw, History } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Draft {
  content: string;
  createdAt: number;
  title: string;
}

// Define default formatting checks state structure
const defaultFormattingChecks = {
  doubleSpaced: false,
  titlePage: false,
  citationsChecked: false
};

const Step9 = () => {
  const [bibliography, setBibliography] = useState("");
  // Initialize with default structure to avoid potential undefined issues
  const [formattingChecks, setFormattingChecks] = useState(defaultFormattingChecks);
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [bibliographySource, setBibliographySource] = useState("");
  const [bibliographyFormat, setBibliographyFormat] = useState("MLA");

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const activeEssayId = getActiveEssay();

    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        setBibliography(data.step9?.bibliography || "");
        setFormattingChecks({
          ...defaultFormattingChecks,
          ...(data.step9?.formattingChecks || {})
        });
        const draftsKey = `essay_drafts_${activeEssayId}`;
        const savedDrafts = JSON.parse(localStorage.getItem(draftsKey) || "[]");
        setDrafts(savedDrafts);
      } else {
         toast.error("Failed to load essay data.");
         navigate('/');
      }
    } else {
        toast.error("No active essay selected.");
        navigate('/');
    }
  }, [navigate]);

  const handleBibliographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBibliography = e.target.value;
    setBibliography(newBibliography);
    if (essayData) {
       setEssayData(prevData => {
         if (!prevData) return null;
         return {
           ...prevData,
           step9: {
             ...(prevData.step9 || { formattingChecks }),
             bibliography: newBibliography,
           }
         };
       });
    }
  };

  // handleCheckChange function remains commented out unless Checkboxes are added back
  /*
  const handleCheckChange = (key: keyof typeof formattingChecks, checked: boolean | "indeterminate") => {
     if (typeof checked !== 'boolean') return;
     const newChecks = { ...formattingChecks, [key]: checked };
     setFormattingChecks(newChecks);
     if (essayData) {
        setEssayData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            step9: {
              ...(prevData.step9 || { bibliography }),
              formattingChecks: newChecks,
            }
          };
        });
     }
   };
   */

  const handleBibliographySourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBibliographySource(e.target.value);
  };

  // --- Basic Implementation for generateBibliographyEntry ---
  const generateBibliographyEntry = () => {
    if (!bibliographySource.trim()) {
        toast.info("Please enter a source to format.");
        return;
    }

    // ** VERY Basic Formatting - Replace with real logic later **
    let formattedEntry = "";
    const source = bibliographySource.trim();
    const now = new Date();

    // Rudimentary detection - highly simplified
    if (source.startsWith('http://') || source.startsWith('https://')) {
        // Assume URL
        const domain = source.split('/')[2] || 'Website';
        formattedEntry = `[${bibliographyFormat}] ${domain}. "${source}". Accessed ${now.toLocaleDateString()}.`;
    } else {
        // Assume Title or other text
        formattedEntry = `[${bibliographyFormat}] ${source}. Publisher details missing. ${now.getFullYear()}.`;
    }
    // ** End Basic Formatting **

    // Append to the existing bibliography
    setBibliography(prev => {
        const newBib = prev ? `${prev}\n${formattedEntry}` : formattedEntry;
         // Also update essayData state directly here if preferred, or rely on handleSave
         if (essayData) {
             setEssayData(prevData => {
               if (!prevData) return null;
               return {
                 ...prevData,
                 step9: {
                   ...(prevData.step9 || { formattingChecks }),
                   bibliography: newBib,
                 }
               };
             });
          }
        return newBib;
    });


    setBibliographySource(""); // Clear the input field
    toast.success("Bibliography entry added", {
      description: `Formatted (basic) as ${bibliographyFormat}`,
    });
  };
  // --- End generateBibliographyEntry Implementation ---


  // This button is no longer needed as bibliography is part of Step 9 data
  /*
  const insertBibliographyToEssay = () => {
    // ... (implementation commented out as button is removed below)
  };
  */

  const handleDoOver = () => {
    if (!essayData) return;
    if (window.confirm("Are you sure you want to restart? This will save your current work as a draft and let you start fresh.")) {
      const content = essayData.step5?.paragraphs ? essayData.step5.paragraphs.join("\n\n") : "";
      if (content.trim()) {
        const draft: Draft = {
          content: content,
          createdAt: new Date().getTime(),
          title: `${essayData.essay.title} (Draft ${drafts.length + 1})`
        };
        const newDrafts = [...drafts, draft];
        const activeEssayId = getActiveEssay();
        if (activeEssayId) {
          const draftsKey = `essay_drafts_${activeEssayId}`;
          localStorage.setItem(draftsKey, JSON.stringify(newDrafts));
        }
        setDrafts(newDrafts);
        const updatedEssayData = { ...essayData };
        if (updatedEssayData.step5) updatedEssayData.step5.paragraphs = [];
        if (updatedEssayData.step4) updatedEssayData.step4.outlineSentences = [];
        // Reset Step 9 data as well? Optional.
        // updatedEssayData.step9 = { bibliography: "", formattingChecks: defaultFormattingChecks };
        // setBibliography("");
        // setFormattingChecks(defaultFormattingChecks);

        setEssayData(updatedEssayData);
        saveEssayData(updatedEssayData);
        toast.success("Draft saved", { description: "Your work has been saved as a draft. You can now start fresh." });
        setShowDraftsDialog(true);
      } else {
        toast.warning("No content to save", { description: "Your essay doesn't have any content to save as a draft." });
      }
    }
  };

  const restoreDraft = (draft: Draft) => {
    if (!essayData) return;
    if (window.confirm("Are you sure you want to restore this draft? This will replace your current work.")) {
      const paragraphs = draft.content.split("\n\n").filter(p => p.trim());
      const outlineSentences = paragraphs.map(paragraph => {
        const match = paragraph.match(/^.+?[.!?](?:\s|$)/);
        return match ? match[0].trim() : paragraph.substring(0, 80).trim() + '...';
      });
      setEssayData(prevData => {
        if (!prevData) return null;
        const restoredData = {
          ...prevData,
          step4: { ...(prevData.step4 || {}), outlineSentences: outlineSentences },
          step5: { ...(prevData.step5 || {}), paragraphs: paragraphs }
          // Keep current Step 9 data or reset? Keeping current for now.
          // step9: { bibliography: bibliography, formattingChecks: formattingChecks }
        };
        // Immediately save the restored state
        saveEssayData(restoredData);
        return restoredData;
      });
      toast.success("Draft restored", { description: "The selected draft has been restored and saved." });
      setShowDraftsDialog(false);
    }
  };

  const deleteDraft = (index: number) => {
    if (window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      const newDrafts = [...drafts];
      newDrafts.splice(index, 1);
      const activeEssayId = getActiveEssay();
      if (activeEssayId) {
        const draftsKey = `essay_drafts_${activeEssayId}`;
        localStorage.setItem(draftsKey, JSON.stringify(newDrafts));
      }
      setDrafts(newDrafts);
      toast.success("Draft deleted", { description: "The draft has been deleted successfully." });
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleSave = (dataToSave: EssayData | null) => {
    if (dataToSave) {
      const finalDataToSave = {
        ...dataToSave,
        step9: { // Ensure latest bibliography/checks from state are saved
          bibliography,
          formattingChecks
        }
      };
      saveEssayData(finalDataToSave);
      toast.info("Progress saved");
    } else {
      toast.error("Cannot save, no essay data loaded.");
    }
  };

  const handleComplete = () => {
    if (!essayData) {
       toast.error("Cannot complete, no essay data loaded.");
       return;
    }
    // Save final state including bibliography
    handleSave(essayData);
    navigate('/');
    toast.success("Essay completed!", {
      description: "Your essay has been finalized. Great job!"
    });
  };

  // canProceed is no longer used for the main Complete button but might be useful elsewhere
  const canProceed = bibliography.trim().length > 0;

  return (
    <StepLayout
      step={9}
      totalSteps={9}
      onSave={() => handleSave(essayData)}
      // StepLayout might use canProceed for its own navigation, keep it updated
      canProceed={canProceed}
      disablePreviousSteps={true}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bibliography & Final Touches</CardTitle>
            <CardDescription>
              Add references, manage drafts, and finalize your essay.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bibliography Formatting Section */}
              <div className="border p-4 rounded-md bg-slate-50/50">
                 <h3 className="text-lg font-medium mb-3">Bibliography Formatter</h3>
                 <div className="flex flex-col space-y-2">
                   <Label htmlFor="bibliography-source">Add Source</Label>
                   <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                     <Input
                       id="bibliography-source"
                       placeholder="Enter URL, book title, DOI, or paste citation"
                       value={bibliographySource}
                       onChange={handleBibliographySourceChange}
                       className="flex-grow"
                     />
                     <Button
                       onClick={generateBibliographyEntry} // Hooked up implemented function
                       className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                     >
                       <Upload className="h-4 w-4 mr-1" />
                       Format & Add
                     </Button>
                   </div>
                   <div className="flex space-x-2 mt-2">
                     <span className="text-sm font-medium mr-2 self-center">Style:</span>
                     <Button
                       variant={bibliographyFormat === "MLA" ? "secondary" : "outline"}
                       onClick={() => setBibliographyFormat("MLA")}
                       size="sm"
                     >
                       MLA
                     </Button>
                     <Button
                       variant={bibliographyFormat === "APA" ? "secondary" : "outline"}
                       onClick={() => setBibliographyFormat("APA")}
                       size="sm"
                     >
                       APA
                     </Button>
                     <Button
                       variant={bibliographyFormat === "Chicago" ? "secondary" : "outline"}
                       onClick={() => setBibliographyFormat("Chicago")}
                       size="sm"
                     >
                       Chicago
                     </Button>
                   </div>
                 </div>
              </div>

              {/* Bibliography Text Area */}
              <div>
                  <Label htmlFor="bibliography-area" className="text-lg font-medium mb-2 block">Bibliography / Works Cited</Label>
                  <Textarea
                    id="bibliography-area"
                    placeholder="Paste your bibliography here, or use the formatter above to add entries..."
                    value={bibliography}
                    onChange={handleBibliographyChange}
                    className="h-64"
                  />
              </div>

              {/* Button removed as per request */}
              {/*
              <Button
                onClick={insertBibliographyToEssay}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Append Bibliography to Essay Text (Manual Step)
              </Button>
              */}

              {/* Formatting Checkboxes Section (remains commented unless needed) */}
              {/* ... */}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
          {/* Left-aligned buttons */}
          <div className="flex gap-2">
             <Button
               variant="outline"
               onClick={() => setShowDraftsDialog(true)}
               className="flex items-center gap-2"
               disabled={drafts.length === 0}
             >
               <History className="h-4 w-4" />
               View Drafts {drafts.length > 0 ? `(${drafts.length})` : ''}
             </Button>

             <Button
               onClick={handleDoOver}
               variant="outline"
               className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
               disabled={!essayData}
             >
               <RefreshCcw className="h-4 w-4" />
               Start Fresh
             </Button>
          </div>

          {/* Right-aligned Complete Button */}
          <Button
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto flex items-center gap-1 py-3 px-6 text-base"
            // --- MODIFIED DISABLED LOGIC ---
            disabled={!essayData} // Only disabled if no essay data is loaded
            // --- END MODIFICATION ---
          >
            <Check className="h-5 w-5" />
            Complete Essay
          </Button>
        </div>
      </div>

      {/* Drafts Dialog (Code remains the same) */}
      <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
         {/* ... Dialog content ... */}
         <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Saved Drafts</DialogTitle>
             <DialogDescription>
               View, restore, or delete previous versions of your essay. Restoring will replace your current editor content and save immediately.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4 mt-4">
             {drafts.length === 0 ? (
               <p className="text-slate-500 text-center py-4">
                 No drafts saved yet. Use the "Start Fresh" button to save your current work as a draft.
               </p>
             ) : (
               [...drafts].reverse().map((draft, index) => (
                 <div key={drafts.length - 1 - index} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                   <div className="flex justify-between items-start mb-2 flex-wrap">
                     <h3 className="font-medium text-lg mr-4">{draft.title}</h3>
                     <span className="text-sm text-slate-500 flex-shrink-0">{formatDate(draft.createdAt)}</span>
                   </div>
                   <div className="max-h-32 overflow-y-auto text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded border border-slate-100">
                     <pre className="whitespace-pre-wrap break-words font-sans">
                       {draft.content.substring(0, 300)}
                       {draft.content.length > 300 ? '...' : ''}
                     </pre>
                   </div>
                   <div className="flex justify-end space-x-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => deleteDraft(drafts.length - 1 - index)}
                       className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                     >
                       Delete
                     </Button>
                     <Button
                       size="sm"
                       onClick={() => restoreDraft(draft)}
                       className="bg-blue-600 hover:bg-blue-700"
                     >
                       Restore Draft
                     </Button>
                   </div>
                 </div>
               ))
             )}
           </div>
         </DialogContent>
      </Dialog>
    </StepLayout>
  );
};

export default Step9;