import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const Step9 = () => {
  const [bibliography, setBibliography] = useState("");
  const [formattingChecks, setFormattingChecks] = useState({
    doubleSpaced: false,
    titlePage: false,
    citationsChecked: false
  });
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
        if (data.step9?.bibliography) {
          setBibliography(data.step9.bibliography);
        }
        
        // Load formatting checks if they exist
        if (data.step9?.formattingChecks) {
          setFormattingChecks(data.step9.formattingChecks);
        }
        
        // Load drafts
        const draftsKey = `essay_drafts_${activeEssayId}`;
        const savedDrafts = JSON.parse(localStorage.getItem(draftsKey) || "[]");
        setDrafts(savedDrafts);
      }
    }
  }, []);

  const handleBibliographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBibliography = e.target.value;
    setBibliography(newBibliography);
    
    // Update the essay data
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
  };

  const handleCheckChange = (key: keyof typeof formattingChecks, checked: boolean) => {
    const newChecks = { ...formattingChecks, [key]: checked };
    setFormattingChecks(newChecks);
    
    // Update the essay data
    if (essayData && essayData.step9) {
      essayData.step9.formattingChecks = newChecks;
    }
  };
  
  const handleBibliographySourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBibliographySource(e.target.value);
  };

  const insertBibliographyToEssay = () => {
    if (!bibliography.trim()) {
      toast("No bibliography to add", {
        description: "Please create a bibliography first"
      });
      return;
    }

    if (essayData && essayData.step5) {
      const currentParagraphs = essayData.step5.paragraphs || [];
      const updatedParagraphs = [...currentParagraphs, "", "Bibliography:", bibliography];
      
      essayData.step5.paragraphs = updatedParagraphs;
      saveEssayData(essayData);
      
      toast.success("Bibliography added to essay");
    }
  };
  
  const handleDoOver = () => {
    if (!essayData) return;
    
    if (window.confirm("Are you sure you want to restart? This will save your current work as a draft and let you start fresh.")) {
      // Get the current essay content
      const content = essayData.step5?.paragraphs ? essayData.step5.paragraphs.join("\n\n") : "";
      
      if (content.trim()) {
        // Save as draft
        const draft = {
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
        
        // Clear current content
        if (essayData.step5) {
          essayData.step5.paragraphs = [];
        }
        
        if (essayData.step4) {
          essayData.step4.outlineSentences = [];
        }
        
        saveEssayData(essayData);
        
        toast.success("Draft saved", {
          description: "Your work has been saved as a draft. You can now start fresh."
        });
        
        // Show drafts after creating one
        setShowDraftsDialog(true);
      } else {
        toast("No content to save", {
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
        return match ? match[0].trim() : paragraph.substring(0, 50).trim();
      });
      
      // Update essay data
      if (!essayData.step4) {
        essayData.step4 = { outlineSentences: [] };
      }
      
      if (!essayData.step5) {
        essayData.step5 = { paragraphs: [] };
      }
      
      essayData.step4.outlineSentences = outlineSentences;
      essayData.step5.paragraphs = paragraphs;
      
      // Save the changes
      saveEssayData(essayData);
      
      toast.success("Draft restored", {
        description: "The selected draft has been restored successfully."
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
      
      toast("Draft deleted", {
        description: "The draft has been deleted successfully."
      });
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      data.step9 = {
        bibliography,
        formattingChecks
      };
      
      saveEssayData(data);
    }
  };

  const handleComplete = () => {
    if (!essayData) return;
    
    handleSave();
    navigate('/');
    toast.success("Essay completed!", {
      description: "Your essay has been finalized. Great job!"
    });
  };

  // Calculate if can proceed: bibliography is not empty
  const canProceed = bibliography.trim().length > 0;

  return (
    <StepLayout 
      step={9} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={canProceed}
      disablePreviousSteps={true}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bibliography</CardTitle>
            <CardDescription>
              Add references and citations to your essay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="bibliography-source">Add Source</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="bibliography-source" 
                    placeholder="Enter URL, book title, or article"
                    value={bibliographySource}
                    onChange={handleBibliographySourceChange}
                  />
                  <Button 
                    onClick={generateBibliographyEntry} 
                    className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Format
                  </Button>
                </div>
                <div className="flex space-x-2 mt-1">
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
              
              <Textarea
                placeholder="Enter your bibliography here..."
                value={bibliography}
                onChange={handleBibliographyChange}
                className="h-64"
              />
              
              <Button 
                onClick={insertBibliographyToEssay}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Insert Bibliography to Essay
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setShowDraftsDialog(true)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            View Drafts
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleDoOver}
              variant="outline"
              className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Start Fresh
            </Button>
            
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Complete Essay
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Drafts</DialogTitle>
            <DialogDescription>
              View and restore previous drafts of your essay
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {drafts.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No drafts saved yet. Use the "Start Fresh" button to create a draft.
              </p>
            ) : (
              drafts.map((draft, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-lg">{draft.title}</h3>
                    <span className="text-sm text-slate-500">{formatDate(draft.createdAt)}</span>
                  </div>
                  <div className="max-h-24 overflow-hidden text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded">
                    {draft.content.substring(0, 200)}
                    {draft.content.length > 200 ? '...' : ''}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteDraft(index)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
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
