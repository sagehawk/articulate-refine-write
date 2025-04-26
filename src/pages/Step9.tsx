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

        // Load bibliography if it exists
        setBibliography(data.step9?.bibliography || "");

        // Load formatting checks, merging with defaults to ensure all keys exist
        setFormattingChecks({
          ...defaultFormattingChecks,
          ...(data.step9?.formattingChecks || {})
        });

        // Load drafts
        const draftsKey = `essay_drafts_${activeEssayId}`;
        const savedDrafts = JSON.parse(localStorage.getItem(draftsKey) || "[]");
        setDrafts(savedDrafts);
      } else {
         // Handle case where essay data for the ID doesn't exist
         toast.error("Failed to load essay data.");
         navigate('/'); // Redirect to home or appropriate page
      }
    } else {
        // Handle case where no active essay ID is found
        toast.error("No active essay selected.");
        navigate('/'); // Redirect to home or appropriate page
    }
  }, [navigate]); // Added navigate to dependency array as it's used inside effect implicitly

  const handleBibliographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBibliography = e.target.value;
    setBibliography(newBibliography);

    // Update the essay data state (will be saved by onSave or handleComplete)
    if (essayData) {
       setEssayData(prevData => {
         if (!prevData) return null;
         return {
           ...prevData,
           step9: {
             ...(prevData.step9 || { formattingChecks }), // Keep existing formattingChecks
             bibliography: newBibliography,
           }
         };
       });
    }
  };

  // This function was defined but not used in the JSX. If needed, add Checkbox components back.
  const handleCheckChange = (key: keyof typeof formattingChecks, checked: boolean | "indeterminate") => {
     if (typeof checked !== 'boolean') return; // Handle 'indeterminate' if necessary, otherwise ignore

     const newChecks = { ...formattingChecks, [key]: checked };
     setFormattingChecks(newChecks);

     // Update the essay data state (will be saved by onSave or handleComplete)
     if (essayData) {
        setEssayData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            step9: {
              ...(prevData.step9 || { bibliography }), // Keep existing bibliography
              formattingChecks: newChecks,
            }
          };
        });
     }
   };

  const handleBibliographySourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBibliographySource(e.target.value);
  };

  // --- FIX FOR ERROR 3: Define generateBibliographyEntry ---
  const generateBibliographyEntry = () => {
    // Placeholder implementation - Replace with actual logic
    console.warn("generateBibliographyEntry function is not implemented yet.");
    if (!bibliographySource.trim()) {
        toast.info("Please enter a source to format.");
        return;
    }
    toast.info(`Formatting "${bibliographySource}" using ${bibliographyFormat} (Not Implemented)`);
    // Example of adding a dummy entry:
    // const formattedEntry = `${bibliographySource} [Formatted as ${bibliographyFormat}] - ${new Date().toLocaleTimeString()}`;
    // setBibliography(prev => prev ? `${prev}\n${formattedEntry}` : formattedEntry);
    // setBibliographySource(""); // Optionally clear the input
  };
  // --- END FIX FOR ERROR 3 ---


  const insertBibliographyToEssay = () => {
    if (!bibliography.trim()) {
      toast.warning("No bibliography to add", {
        description: "Please create or paste your bibliography first."
      });
      return;
    }

    if (essayData && essayData.step5) {
       setEssayData(prevData => {
         if (!prevData || !prevData.step5) return prevData; // Should not happen if essayData exists

         const currentParagraphs = prevData.step5.paragraphs || [];
         // Avoid adding multiple times if already present? (Optional check)
         const updatedParagraphs = [...currentParagraphs, "", "Bibliography", bibliography]; // Using "Bibliography" as a heading

         return {
           ...prevData,
           step5: {
             ...prevData.step5,
             paragraphs: updatedParagraphs,
           }
         };
       });
       toast.success("Bibliography prepared", {
         description: "It will be saved with your essay progress."
       });
       // Note: The actual saving happens via handleSave or handleComplete
    } else {
       toast.error("Cannot add bibliography", {
         description: "Essay content structure is missing."
       });
    }
  };

  const handleDoOver = () => {
    if (!essayData) return;

    if (window.confirm("Are you sure you want to restart? This will save your current work as a draft and let you start fresh.")) {
      // Get the current essay content
      const content = essayData.step5?.paragraphs ? essayData.step5.paragraphs.join("\n\n") : "";

      if (content.trim()) {
        // Save as draft
        const draft: Draft = {
          content: content,
          createdAt: new Date().getTime(),
          title: `${essayData.essay.title} (Draft ${drafts.length + 1})`
        };

        const newDrafts = [...drafts, draft];

        // Store in localStorage
        const activeEssayId = getActiveEssay();
        if (activeEssayId) {
          const draftsKey = `essay_drafts_${activeEssayId}`;
          localStorage.setItem(draftsKey, JSON.stringify(newDrafts));
        }

        // Update state
        setDrafts(newDrafts);

        // Clear current content in the state
        const updatedEssayData = { ...essayData };
        if (updatedEssayData.step5) {
          updatedEssayData.step5.paragraphs = [];
        }
        if (updatedEssayData.step4) {
          updatedEssayData.step4.outlineSentences = [];
        }
        // Also clear Step 9 data? Decide based on desired behavior.
        // updatedEssayData.step9 = { bibliography: "", formattingChecks: defaultFormattingChecks };

        setEssayData(updatedEssayData); // Update state with cleared content
        saveEssayData(updatedEssayData); // Save the cleared state

        toast.success("Draft saved", {
          description: "Your work has been saved as a draft. You can now start fresh."
        });

        // Consider navigating to an earlier step
        // navigate('/step4');

        // Show drafts after creating one
        setShowDraftsDialog(true);
      } else {
        toast.warning("No content to save", {
          description: "Your essay doesn't have any content to save as a draft."
        });
      }
    }
  };

  const restoreDraft = (draft: Draft) => {
    if (!essayData) return;

    if (window.confirm("Are you sure you want to restore this draft? This will replace your current work.")) {
      // Split the content into paragraphs
      const paragraphs = draft.content.split("\n\n").filter(p => p.trim());

      // Extract first sentences for outline
      const outlineSentences = paragraphs.map(paragraph => {
        const match = paragraph.match(/^.+?[.!?](?:\s|$)/);
        return match ? match[0].trim() : paragraph.substring(0, 80).trim() + '...'; // Adjusted length/indicator
      });

      // Update essay data state
      setEssayData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          step4: { // Assume step4 structure exists or create it
            ...(prevData.step4 || {}),
            outlineSentences: outlineSentences,
          },
          step5: { // Assume step5 structure exists or create it
             ...(prevData.step5 || {}),
             paragraphs: paragraphs,
          }
          // Decide if step 9 data should be cleared or kept when restoring
          // step9: { bibliography: "", formattingChecks: defaultFormattingChecks }
        };
      });

      // Note: The save will happen via handleSave or handleComplete.
      // If immediate save is desired: saveEssayData({...essayData, step4: ..., step5: ...});

      toast.success("Draft restored", {
        description: "The selected draft has been restored successfully. Remember to save your progress."
      });

      // Hide drafts after restoring
      setShowDraftsDialog(false);
    }
  };

  const deleteDraft = (index: number) => {
    if (window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      const newDrafts = [...drafts];
      newDrafts.splice(index, 1);

      // Update localStorage
      const activeEssayId = getActiveEssay();
      if (activeEssayId) {
        const draftsKey = `essay_drafts_${activeEssayId}`;
        localStorage.setItem(draftsKey, JSON.stringify(newDrafts));
      }

      // Update state
      setDrafts(newDrafts);

      toast.success("Draft deleted", {
        description: "The draft has been deleted successfully."
      });
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleSave = (dataToSave: EssayData | null) => { // Accept null in case essayData is null
    if (dataToSave) {
      // Ensure step9 data is included before saving
      const finalDataToSave = {
        ...dataToSave,
        step9: {
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

    // --- FIX FOR ERROR 2: Pass essayData to handleSave ---
    handleSave(essayData);
    // --- END FIX FOR ERROR 2 ---

    navigate('/');
    toast.success("Essay completed!", {
      description: "Your essay has been finalized. Great job!"
    });
  };

  // Calculate if can proceed: bibliography is not empty (or any other final checks)
  const canProceed = bibliography.trim().length > 0;

  return (
    <StepLayout
      step={9}
      totalSteps={9}
      onSave={() => handleSave(essayData)} // Pass current state to StepLayout's save trigger
      canProceed={canProceed} // Example: Allow proceeding only if bibliography exists
      disablePreviousSteps={true} // Assuming this prevents going back easily
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bibliography & Final Touches</CardTitle> {/* Updated Title */}
            <CardDescription>
              Add references, manage drafts, and finalize your essay. {/* Updated Desc */}
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
                       placeholder="Enter URL, book title, DOI, or paste citation" // Updated placeholder
                       value={bibliographySource}
                       onChange={handleBibliographySourceChange}
                       className="flex-grow"
                     />
                     <Button
                       onClick={generateBibliographyEntry} // Corrected: Function now exists
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
                    className="h-64" /* Increased height */
                  />
              </div>

              {/* Insert to Essay Button (Optional utility) */}
              {/* Consider if this button is needed if saving handles appending */}
              {/* <Button
                onClick={insertBibliographyToEssay}
                className="w-full bg-indigo-600 hover:bg-indigo-700" // Changed color for distinction
              >
                <Upload className="h-4 w-4 mr-2" />
                Append Bibliography to Essay Text (Manual Step)
              </Button> */}

              {/* Add Formatting Checkboxes here if needed */}
              {/*
              <div className="space-y-2 border p-4 rounded-md bg-slate-50/50">
                 <h3 className="text-lg font-medium mb-2">Formatting Checklist</h3>
                 <div className="flex items-center space-x-2">
                   <Checkbox
                     id="doubleSpaced"
                     checked={formattingChecks.doubleSpaced}
                     onCheckedChange={(checked) => handleCheckChange('doubleSpaced', checked)}
                   />
                   <Label htmlFor="doubleSpaced">Essay is double-spaced</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Checkbox
                      id="titlePage"
                      checked={formattingChecks.titlePage}
                      onCheckedChange={(checked) => handleCheckChange('titlePage', checked)}
                    />
                   <Label htmlFor="titlePage">Includes required title page information</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                   <Checkbox
                      id="citationsChecked"
                      checked={formattingChecks.citationsChecked}
                      onCheckedChange={(checked) => handleCheckChange('citationsChecked', checked)}
                    />
                   <Label htmlFor="citationsChecked">In-text citations match bibliography</Label>
                 </div>
               </div>
              */}
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
               disabled={drafts.length === 0} // Disable if no drafts
             >
               <History className="h-4 w-4" />
               View Drafts {drafts.length > 0 ? `(${drafts.length})` : ''}
             </Button>

             <Button
               onClick={handleDoOver}
               variant="outline"
               className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1"
               disabled={!essayData} // Disable if no essay data
             >
               <RefreshCcw className="h-4 w-4" />
               Start Fresh
             </Button>
          </div>

          {/* Right-aligned Complete Button */}
          <Button
            onClick={handleComplete}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto flex items-center gap-1 py-3 px-6 text-base" // Make Complete button more prominent
            disabled={!essayData || !canProceed} // Disable if no data or cannot proceed (e.g., no bibliography)
          >
            <Check className="h-5 w-5" /> {/* Slightly larger icon */}
            Complete Essay
          </Button>
        </div>
      </div>

      {/* Drafts Dialog */}
      <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Drafts</DialogTitle>
            <DialogDescription>
              View, restore, or delete previous versions of your essay. Restoring will replace your current editor content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {drafts.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No drafts saved yet. Use the "Start Fresh" button to save your current work as a draft.
              </p>
            ) : (
              [...drafts].reverse().map((draft, index) => ( // Show newest first
                <div key={drafts.length - 1 - index} /* Use original index for deletion */ className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2 flex-wrap">
                    <h3 className="font-medium text-lg mr-4">{draft.title}</h3>
                    <span className="text-sm text-slate-500 flex-shrink-0">{formatDate(draft.createdAt)}</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded border border-slate-100">
                    {/* Display content safely */}
                    <pre className="whitespace-pre-wrap break-words font-sans">
                      {draft.content.substring(0, 300)}
                      {draft.content.length > 300 ? '...' : ''}
                    </pre>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDraft(drafts.length - 1 - index)} // Adjust index for reversed array
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