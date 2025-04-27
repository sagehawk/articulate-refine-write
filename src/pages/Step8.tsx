import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCcw, Check } from "lucide-react";

interface Draft {
  content: string;
  createdAt: number;
  title: string;
}

const Step8 = () => {
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  const navigate = useNavigate();

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

        // Clear current content
        const updatedEssayData = { ...essayData };
        if (updatedEssayData.step5) {
          updatedEssayData.step5.paragraphs = [];
        }

        if (updatedEssayData.step4) {
          updatedEssayData.step4.outlineSentences = [];
        }

        setEssayData(updatedEssayData);
        saveEssayData(updatedEssayData);

        toast.success("Draft saved", {
          description: "Your work has been saved as a draft. You can now start fresh."
        });

        // Redirect to an earlier step
        navigate('/step4');
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
      const updatedEssayData = { ...essayData };
      if (!updatedEssayData.step4) {
        updatedEssayData.step4 = { outlineSentences: [] };
      }

      if (!updatedEssayData.step5) {
        updatedEssayData.step5 = { paragraphs: [] };
      }

      updatedEssayData.step4.outlineSentences = outlineSentences;
      updatedEssayData.step5.paragraphs = paragraphs;

      // Save the changes
      setEssayData(updatedEssayData);
      saveEssayData(updatedEssayData);

      toast.success("Draft restored", {
        description: "The selected draft has been restored successfully."
      });

      // Hide drafts after restoring (if a draft UI was shown)
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
    toast.info("Progress saved");
  };

  return (
    <StepLayout
      step={8}
      totalSteps={9}
      onSave={() => essayData && handleSave(essayData)}
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
              disabled={!essayData}
            >
              <RefreshCcw className="h-5 w-5" />
              <span>Start Fresh (Save Current as Draft)</span>
            </Button>

            <Button
              onClick={() => navigate('/step9')}
              className="w-full py-6 text-lg space-x-2 bg-green-600 hover:bg-green-700"
              disabled={!essayData}
            >
              <Check className="h-5 w-5" />
              <span>Finalize Essay (Go to Step 9)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </StepLayout>
  );
};

export default Step8;
