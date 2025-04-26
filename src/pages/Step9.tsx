import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const defaultFormattingChecks = {
  doubleSpaced: false,
  titlePage: false,
  citationsChecked: false
};

// Define a constant for the Bibliography heading to ensure consistency
const BIBLIOGRAPHY_HEADING = "Bibliography";

const Step9 = () => {
  const [bibliography, setBibliography] = useState("");
  const [formattingChecks, setFormattingChecks] = useState(defaultFormattingChecks);
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [bibliographySource, setBibliographySource] = useState("");
  const [bibliographyFormat, setBibliographyFormat] = useState("MLA"); // Keep for potential future advanced formatting

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
    // No need to update essayData here immediately, handleSave/handleComplete will use the state
  };

  const handleBibliographySourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBibliographySource(e.target.value);
  };

  // --- generateBibliographyEntry - Removed Style Prefix ---
  const generateBibliographyEntry = () => {
    if (!bibliographySource.trim()) {
        toast.info("Please enter a source to format.");
        return;
    }

    // ** Basic Formatting - Replace with real logic later **
    let formattedEntry = "";
    const source = bibliographySource.trim();
    const now = new Date();

    if (source.startsWith('http://') || source.startsWith('https://')) {
        // Assume URL
        const domain = source.split('/')[2] || 'Website';
        // --- MODIFICATION: Removed [${bibliographyFormat}] ---
        formattedEntry = `${domain}. "${source}". Accessed ${now.toLocaleDateString()}.`;
    } else {
        // Assume Title or other text
        // --- MODIFICATION: Removed [${bibliographyFormat}] ---
        formattedEntry = `${source}. Publisher details missing. ${now.getFullYear()}.`;
    }
    // ** End Basic Formatting **

    // Append to the existing bibliography state
    setBibliography(prev => {
        const newBib = prev ? `${prev.trim()}\n${formattedEntry}` : formattedEntry;
        return newBib;
    });

    setBibliographySource(""); // Clear the input field
    toast.success("Bibliography entry added");
  };
  // --- End generateBibliographyEntry Implementation ---

  const handleDoOver = () => {
    if (!essayData) return;
    if (window.confirm("Are you sure you want to restart? This will save your current work as a draft and let you start fresh.")) {
      const content = essayData.step5?.paragraphs ? essayData.step5.paragraphs.join("\n\n") : "";
      if (content.trim()) {
        // Create and save draft (same as before)
        const draft: Draft = {
          content: content, createdAt: new Date().getTime(),
          title: `${essayData.essay.title} (Draft ${drafts.length + 1})`
        };
        const newDrafts = [...drafts, draft];
        const activeEssayId = getActiveEssay();
        if (activeEssayId) {
          const draftsKey = `essay_drafts_${activeEssayId}`;
          localStorage.setItem(draftsKey, JSON.stringify(newDrafts));
        }
        setDrafts(newDrafts);

        // Clear content in essayData state
        const updatedEssayData = { ...essayData };
        if (updatedEssayData.step5) updatedEssayData.step5.paragraphs = [];
        if (updatedEssayData.step4) updatedEssayData.step4.outlineSentences = [];
        // Reset Step 9 data too
        updatedEssayData.step9 = { bibliography: "", formattingChecks: defaultFormattingChecks };

        setEssayData(updatedEssayData); // Update state
        setBibliography(""); // Reset local state too
        setFormattingChecks(defaultFormattingChecks);
        saveEssayData(updatedEssayData); // Save cleared state

        toast.success("Draft saved", { description: "Your work has been saved as a draft. You can now start fresh." });
        setShowDraftsDialog(true); // Show drafts dialog
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

      // Check if the restored content includes a bibliography section
      let restoredBibliography = "";
      let mainParagraphs = [...paragraphs]; // Start with all paragraphs
      const bibHeadingIndex = paragraphs.findIndex(p => p.trim() === BIBLIOGRAPHY_HEADING);

      if (bibHeadingIndex !== -1) {
        // Found the heading, assume the next paragraph is the bibliography
        if (bibHeadingIndex + 1 < paragraphs.length) {
          restoredBibliography = paragraphs[bibHeadingIndex + 1];
        }
        // Remove the heading and bibliography from the main paragraphs
        mainParagraphs = paragraphs.slice(0, bibHeadingIndex).filter(p => p.trim() !== ""); // Remove trailing empty lines too
      }

      setEssayData(prevData => {
        if (!prevData) return null;
        const restoredData = {
          ...prevData,
          step4: { ...(prevData.step4 || {}), outlineSentences: outlineSentences },
          step5: { ...(prevData.step5 || {}), paragraphs: mainParagraphs }, // Save paragraphs without bibliography
          step9: { // Update step9 bibliography from restored content
            ...(prevData.step9 || {}),
            bibliography: restoredBibliography,
            formattingChecks: formattingChecks // Keep current checks or reset? Keeping current.
          }
        };
        saveEssayData(restoredData); // Save immediately after restoring
        setBibliography(restoredBibliography); // Update local bibliography state
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
      toast.success("Draft deleted");
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // handleSave is used by StepLayout for intermediate saves
  const handleSave = (dataToSave: EssayData | null) => {
    if (dataToSave) {
      // Ensure step9 data reflects the current state when saving
      const finalDataToSave = {
        ...dataToSave,
        step9: {
          bibliography, // Use current bibliography state
          formattingChecks
        }
      };
      saveEssayData(finalDataToSave);
      toast.info("Progress saved");
    } else {
      toast.error("Cannot save, no essay data loaded.");
    }
  };

  // --- handleComplete - Modified to merge Bibliography ---
  const handleComplete = () => {
    if (!essayData) {
       toast.error("Cannot complete, no essay data loaded.");
       return;
    }

    // 1. Create a final copy of the essay data to save
    const finalEssayData = JSON.parse(JSON.stringify(essayData)) as EssayData; // Deep copy to avoid mutation issues

    // 2. Ensure step5 structure exists
    if (!finalEssayData.step5) {
      finalEssayData.step5 = { paragraphs: [] };
    }

    // 3. Get the current bibliography content from state
    const bibContent = bibliography.trim();

    // 4. Prepare the paragraphs array - Remove any *previous* bibliography section
    let currentParagraphs = finalEssayData.step5.paragraphs || [];
    const bibHeadingIndex = currentParagraphs.findIndex(p => p.trim() === BIBLIOGRAPHY_HEADING);

    if (bibHeadingIndex !== -1) {
      // Remove the heading and everything after it from the paragraphs array
      currentParagraphs = currentParagraphs.slice(0, bibHeadingIndex);
    }
    // Remove trailing empty strings before potentially adding the new bibliography
    while (currentParagraphs.length > 0 && currentParagraphs[currentParagraphs.length - 1].trim() === "") {
        currentParagraphs.pop();
    }

    // 5. Append the current bibliography (if it exists) to the paragraphs
    if (bibContent) {
        currentParagraphs.push(""); // Add a separator line
        currentParagraphs.push(BIBLIOGRAPHY_HEADING); // Add the heading
        currentParagraphs.push(bibContent); // Add the bibliography text
    }

    // 6. Update the paragraphs in our final save object
    finalEssayData.step5.paragraphs = currentParagraphs;

    // 7. Ensure step9 data is also up-to-date in the final save object
    finalEssayData.step9 = {
      bibliography: bibliography, // Save the bibliography state here too for consistency/easy access
      formattingChecks: formattingChecks
    };

    // 8. Save the fully updated essay data
    saveEssayData(finalEssayData);

    // 9. Navigate and notify
    navigate('/');
    toast.success("Essay completed!", {
      description: "Your final essay including bibliography has been saved."
    });
  };
  // --- End handleComplete Modification ---

  const canProceed = true; // Enable proceeding regardless of bibliography content

  return (
    <StepLayout
      step={9}
      totalSteps={9}
      onSave={() => handleSave(essayData)} // StepLayout uses this for intermediate saves
      canProceed={canProceed} // Allow proceeding (used by StepLayout's nav)
      disablePreviousSteps={true}
    >
      <div className="space-y-6">
        <Card>
           {/* Card Header and Content (Bibliography Formatter, Textarea) remain the same */}
           <CardHeader>
             <CardTitle>Bibliography & Final Touches</CardTitle>
             <CardDescription>
               Add references using the formatter or paste directly. Manage drafts and finalize your essay.
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
                        placeholder="Enter URL, book title, DOI, etc."
                        value={bibliographySource}
                        onChange={handleBibliographySourceChange}
                        className="flex-grow"
                      />
                      <Button
                        onClick={generateBibliographyEntry}
                        className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Format & Add
                      </Button>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <span className="text-sm font-medium mr-2 self-center">Style (for future use):</span>
                      <Button variant={bibliographyFormat === "MLA" ? "secondary" : "outline"} onClick={() => setBibliographyFormat("MLA")} size="sm">MLA</Button>
                      <Button variant={bibliographyFormat === "APA" ? "secondary" : "outline"} onClick={() => setBibliographyFormat("APA")} size="sm">APA</Button>
                      <Button variant={bibliographyFormat === "Chicago" ? "secondary" : "outline"} onClick={() => setBibliographyFormat("Chicago")} size="sm">Chicago</Button>
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
             </div>
           </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
          {/* Left-aligned buttons */}
          <div className="flex gap-2">
             <Button
               variant="outline" onClick={() => setShowDraftsDialog(true)}
               className="flex items-center gap-2" disabled={drafts.length === 0}
             >
               <History className="h-4 w-4" /> View Drafts {drafts.length > 0 ? `(${drafts.length})` : ''}
             </Button>
             <Button
               onClick={handleDoOver} variant="outline"
               className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1" disabled={!essayData}
             >
               <RefreshCcw className="h-4 w-4" /> Start Fresh
             </Button>
          </div>

          {/* Right-aligned Complete Button */}
          <Button
            onClick={handleComplete} // Uses the modified handleComplete
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto flex items-center gap-1 py-3 px-6 text-base"
            disabled={!essayData} // Only disabled if essayData hasn't loaded
          >
            <Check className="h-5 w-5" />
            Complete Essay
          </Button>
        </div>
      </div>

      {/* Drafts Dialog (Content remains the same, but restore logic updated) */}
      <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Drafts</DialogTitle>
            <DialogDescription>
              View, restore, or delete previous versions. Restoring replaces current work and saves immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {drafts.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No drafts saved yet.</p>
            ) : (
              [...drafts].reverse().map((draft, index) => (
                <div key={drafts.length - 1 - index} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  {/* Draft details... */}
                   <div className="flex justify-between items-start mb-2 flex-wrap">
                     <h3 className="font-medium text-lg mr-4">{draft.title}</h3>
                     <span className="text-sm text-slate-500 flex-shrink-0">{formatDate(draft.createdAt)}</span>
                   </div>
                   <div className="max-h-32 overflow-y-auto text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded border border-slate-100">
                     <pre className="whitespace-pre-wrap break-words font-sans">
                       {draft.content.substring(0, 300)}{draft.content.length > 300 ? '...' : ''}
                     </pre>
                   </div>
                   <div className="flex justify-end space-x-2">
                     <Button
                       variant="outline" size="sm" onClick={() => deleteDraft(drafts.length - 1 - index)}
                       className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                     >Delete</Button>
                     <Button size="sm" onClick={() => restoreDraft(draft)} className="bg-blue-600 hover:bg-blue-700">Restore Draft</Button>
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