import { useState, useEffect, useCallback } from "react";
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

const BIBLIOGRAPHY_HEADING = "Bibliography";

const Step9 = () => {
  // --- State Definitions ---
  const [bibliography, setBibliography] = useState("");
  const [formattingChecks, setFormattingChecks] = useState(defaultFormattingChecks);
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [bibliographySource, setBibliographySource] = useState("");
  const [bibliographyFormat, setBibliographyFormat] = useState("MLA");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const navigate = useNavigate();

  // --- useEffect ---
  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        setBibliography(data.step9?.bibliography || "");
        setFormattingChecks({ ...defaultFormattingChecks, ...(data.step9?.formattingChecks || {}) });
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

  // --- Event Handlers ---
  const handleBibliographyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBibliography(e.target.value);
    
    // Update essayData in real-time
    if (essayData) {
      if (!essayData.step9) {
        essayData.step9 = { 
          bibliography: e.target.value, 
          formattingChecks: formattingChecks 
        };
      } else {
        essayData.step9.bibliography = e.target.value;
      }
    }
  }, [essayData, formattingChecks]);

  const handleBibliographySourceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBibliographySource(e.target.value);
  }, []);

  // Correctly implemented generateBibliographyEntry with useCallback
  const generateBibliographyEntry = useCallback(() => {
    if (!bibliographySource.trim()) {
        toast.info("Please enter a source to format.");
        return;
    }
    let formattedEntry = "";
    const source = bibliographySource.trim();
    const now = new Date();
    if (source.startsWith('http://') || source.startsWith('https://')) {
        const domain = source.split('/')[2] || 'Website';
        formattedEntry = `${domain}. "${source}". Accessed ${now.toLocaleDateString()}.`;
    } else {
        formattedEntry = `${source}. Publisher details missing. ${now.getFullYear()}.`;
    }
    
    const newBibliography = bibliography ? `${bibliography.trim()}\n${formattedEntry}` : formattedEntry;
    setBibliography(newBibliography);
    
    // Update essayData in real-time
    if (essayData) {
      if (!essayData.step9) {
        essayData.step9 = { 
          bibliography: newBibliography, 
          formattingChecks: formattingChecks 
        };
      } else {
        essayData.step9.bibliography = newBibliography;
      }
    }
    
    setBibliographySource(""); // Clear the input field
    toast.success("Bibliography entry added");
  }, [bibliographySource, bibliography, essayData, formattingChecks]); 

  // Add a function to insert bibliography into essay content
  const insertBibliographyIntoEssay = useCallback(() => {
    if (!essayData || !bibliography.trim()) {
      toast.info("No bibliography to insert.");
      return;
    }
    
    const updatedEssayData = { ...essayData };
    if (!updatedEssayData.step5) updatedEssayData.step5 = { paragraphs: [] };
    
    let paragraphs = [...updatedEssayData.step5.paragraphs || []];
    
    // Remove any existing bibliography heading and content
    const bibHeadingIndex = paragraphs.findIndex(p => p.trim() === BIBLIOGRAPHY_HEADING);
    if (bibHeadingIndex !== -1) {
      paragraphs = paragraphs.slice(0, bibHeadingIndex);
    }
    
    // Ensure there's a space before bibliography
    if (paragraphs.length > 0 && paragraphs[paragraphs.length - 1].trim() !== "") {
      paragraphs.push("");
    }
    
    // Add bibliography heading and content
    paragraphs.push(BIBLIOGRAPHY_HEADING);
    paragraphs.push(bibliography);
    
    updatedEssayData.step5.paragraphs = paragraphs;
    updatedEssayData.step9 = { 
      ...updatedEssayData.step9 || {}, 
      bibliography, 
      formattingChecks 
    };
    
    setEssayData(updatedEssayData);
    saveEssayData(updatedEssayData);
    toast.success("Bibliography inserted into essay");
  }, [essayData, bibliography, formattingChecks]);

  const handleDoOver = useCallback(() => {
    if (!essayData) return;
    if (window.confirm("Are you sure you want to restart? This will save your current work as a draft and let you start fresh.")) {
      const content = essayData.step5?.paragraphs ? essayData.step5.paragraphs.join("\n\n") : "";
      if (content.trim()) {
        const draft: Draft = { content, createdAt: new Date().getTime(), title: `${essayData.essay.title} (Draft ${drafts.length + 1})` };
        const newDrafts = [...drafts, draft];
        const activeEssayId = getActiveEssay();
        if (activeEssayId) localStorage.setItem(`essay_drafts_${activeEssayId}`, JSON.stringify(newDrafts));
        setDrafts(newDrafts);
        const updatedEssayData = { ...essayData };
        if (updatedEssayData.step5) updatedEssayData.step5.paragraphs = [];
        if (updatedEssayData.step4) updatedEssayData.step4.outlineSentences = [];
        updatedEssayData.step9 = { bibliography: "", formattingChecks: defaultFormattingChecks };
        setEssayData(updatedEssayData);
        setBibliography("");
        setFormattingChecks(defaultFormattingChecks);
        saveEssayData(updatedEssayData);
        toast.success("Draft saved"); 
        setShowDraftsDialog(true);
        navigate('/step4'); // Navigate to step 4 to start fresh
      } else { 
        toast.warning("No content to save"); 
      }
    }
  }, [essayData, drafts, navigate]); 

  const restoreDraft = useCallback((draft: Draft) => {
    if (!essayData) return;
    if (window.confirm("Are you sure you want to restore this draft? This will replace your current work.")) {
      const paragraphs = draft.content.split("\n\n").filter(p => p.trim());
      const outlineSentences = paragraphs.map(p => p.match(/^.+?[.!?](?:\s|$)/)?.[0].trim() || p.substring(0, 80).trim() + '...');
      let restoredBibliography = "";
      let mainParagraphs = [...paragraphs];
      const bibHeadingIndex = paragraphs.findIndex(p => p.trim() === BIBLIOGRAPHY_HEADING);
      if (bibHeadingIndex !== -1) {
        if (bibHeadingIndex + 1 < paragraphs.length) restoredBibliography = paragraphs[bibHeadingIndex + 1];
        mainParagraphs = paragraphs.slice(0, bibHeadingIndex).filter(p => p.trim() !== "");
      }
      const restoredData = {
        ...essayData,
        step4: { ...(essayData.step4 || {}), outlineSentences },
        step5: { ...(essayData.step5 || {}), paragraphs: mainParagraphs },
        step9: { ...(essayData.step9 || {}), bibliography: restoredBibliography, formattingChecks }
      };
      saveEssayData(restoredData);
      setEssayData(restoredData); 
      setBibliography(restoredBibliography);
      toast.success("Draft restored"); 
      setShowDraftsDialog(false);
    }
  }, [essayData, formattingChecks]); 

  const deleteDraft = useCallback((index: number) => {
    if (window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      const newDrafts = [...drafts];
      newDrafts.splice(index, 1);
      const activeEssayId = getActiveEssay();
      if (activeEssayId) localStorage.setItem(`essay_drafts_${activeEssayId}`, JSON.stringify(newDrafts));
      setDrafts(newDrafts);
      toast.success("Draft deleted");
    }
  }, [drafts]); 

  const formatDate = useCallback((timestamp: number): string => new Date(timestamp).toLocaleString(), []);

  const handleSave = useCallback((dataToSave: EssayData | null) => {
    if (dataToSave) {
      // We keep the real-time updated bibliography when saving
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
  }, [bibliography, formattingChecks]);

  const handleComplete = useCallback(() => {
    if (!essayData) { 
      toast.error("Cannot complete, no essay data loaded."); 
      return; 
    }
    const finalEssayData = JSON.parse(JSON.stringify(essayData)) as EssayData;
    if (!finalEssayData.step5) finalEssayData.step5 = { paragraphs: [] };
    const bibContent = bibliography.trim();
    let currentParagraphs = finalEssayData.step5.paragraphs || [];
    const bibHeadingIndex = currentParagraphs.findIndex(p => p.trim() === BIBLIOGRAPHY_HEADING);
    if (bibHeadingIndex !== -1) currentParagraphs = currentParagraphs.slice(0, bibHeadingIndex);
    while (currentParagraphs.length > 0 && currentParagraphs[currentParagraphs.length - 1].trim() === "") currentParagraphs.pop();
    if (bibContent) { 
      currentParagraphs.push(""); 
      currentParagraphs.push(BIBLIOGRAPHY_HEADING); 
      currentParagraphs.push(bibContent); 
    }
    finalEssayData.step5.paragraphs = currentParagraphs;
    finalEssayData.step9 = { bibliography, formattingChecks };
    saveEssayData(finalEssayData);
    navigate('/');
    toast.success("Essay completed!");
  }, [essayData, bibliography, formattingChecks, navigate]);

  const canProceed = true;

  return (
    <StepLayout
      step={9} 
      totalSteps={9}
      onSave={() => handleSave(essayData)}
      canProceed={canProceed}
    >
      <div className="space-y-6">
        <Card>
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
                        id="bibliography-source" placeholder="Enter URL, book title, DOI, etc."
                        value={bibliographySource} onChange={handleBibliographySourceChange}
                        className="flex-grow"
                      />
                      <Button
                        onClick={generateBibliographyEntry}
                        className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      >
                        <Upload className="h-4 w-4 mr-1" /> Format & Add
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
                     id="bibliography-area" placeholder="Paste your bibliography here, or use the formatter above to add entries..."
                     value={bibliography} onChange={handleBibliographyChange}
                     className="h-64"
                   />
               </div>
               
               {/* Insert Bibliography Button */}
               <Button 
                 onClick={insertBibliographyIntoEssay} 
                 className="w-full bg-green-600 hover:bg-green-700"
                 disabled={!bibliography.trim()}
               >
                 <Check className="h-4 w-4 mr-2" /> Insert Bibliography into Essay
               </Button>
             </div>
           </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setShowDraftsDialog(true)} className="flex items-center gap-2" disabled={drafts.length === 0}>
               <History className="h-4 w-4" /> View Drafts {drafts.length > 0 ? `(${drafts.length})` : ''}
             </Button>
             <Button onClick={handleDoOver} variant="outline" className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-1" disabled={!essayData}>
               <RefreshCcw className="h-4 w-4" /> Start Fresh
             </Button>
          </div>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto flex items-center gap-1 py-3 px-6 text-base" disabled={!essayData}>
            <Check className="h-5 w-5" /> Complete Essay
          </Button>
        </div>
      </div>

      {/* Drafts Dialog */}
      <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Drafts</DialogTitle>
            <DialogDescription>
              View, restore, or delete previous versions. Restoring replaces current work and saves immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {drafts.length === 0 ? ( <p className="text-slate-500 text-center py-4">No drafts saved yet.</p> ) : (
              [...drafts].reverse().map((draft, index) => (
                <div key={drafts.length - 1 - index} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                   <div className="flex justify-between items-start mb-2 flex-wrap">
                     <h3 className="font-medium text-lg mr-4">{draft.title}</h3>
                     <span className="text-sm text-slate-500 flex-shrink-0">{formatDate(draft.createdAt)}</span>
                   </div>
                   <div className="max-h-32 overflow-y-auto text-sm text-slate-700 mb-3 bg-slate-50 p-3 rounded border border-slate-100">
                     <pre className="whitespace-pre-wrap break-words font-sans">{draft.content.substring(0, 300)}{draft.content.length > 300 ? '...' : ''}</pre>
                   </div>
                   <div className="flex justify-end space-x-2">
                     <Button variant="outline" size="sm" onClick={() => deleteDraft(drafts.length - 1 - index)} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">Delete</Button>
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
