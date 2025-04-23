
import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw, Sparkles } from "lucide-react";

interface Draft {
  content: string;
  createdAt: number;
  title: string;
}

const Step8 = () => {
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        // Load drafts
        const draftsKey = `essay_drafts_${activeEssayId}`;
        const savedDrafts = JSON.parse(localStorage.getItem(draftsKey) || "[]");
        setDrafts(savedDrafts);
      }
    }
  }, []);

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
        setShowDrafts(true);
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
      setShowDrafts(false);
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
    saveEssayData(data);
  };

  return (
    <StepLayout 
      step={8} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={true}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Restructure Your Essay
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fresh Perspective</CardTitle>
          <CardDescription>
            Sometimes, starting fresh can lead to breakthrough improvements in your writing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-6">
            Peterson suggests that sometimes the best way to improve your essay is to step back and 
            start with a fresh perspective. This allows you to see your argument more clearly and 
            restructure it in a more compelling way.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={handleDoOver}
              className="w-full py-6 text-lg space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCcw className="h-5 w-5" />
              <span>Start Fresh (Save Current as Draft)</span>
            </Button>
            
            <Button 
              onClick={() => setShowDrafts(!showDrafts)}
              variant="outline"
              className="w-full py-6 text-lg space-x-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>{showDrafts ? "Hide Saved Drafts" : "View Saved Drafts"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {showDrafts && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Drafts</CardTitle>
            <CardDescription>
              You can restore a previous draft or delete drafts you no longer need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                No drafts saved yet. Use the "Start Fresh" button to create a draft.
              </p>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft, index) => (
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </StepLayout>
  );
};

export default Step8;
