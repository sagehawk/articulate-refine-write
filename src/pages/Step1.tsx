
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepLayout } from "@/components/layout/StepLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EssayData, Step1Data } from "@/types/essay";
import { getActiveEssay, getEssayData, createNewEssay, saveEssayData } from "@/utils/localStorage";

const Step1 = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [timeManagement, setTimeManagement] = useState("");
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [isNewEssay, setIsNewEssay] = useState(true);

  // Check if we're editing an existing essay or creating a new one
  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        setTitle(data.essay.title);
        
        if (data.step1) {
          setGoal(data.step1.goal || "");
          setWorkspace(data.step1.workspace || "");
          setTimeManagement(data.step1.timeManagement || "");
        }
        
        setIsNewEssay(false);
      }
    }
  }, []);

  const handleSave = (data: EssayData) => {
    // For new essays, create and initialize
    if (isNewEssay && title.trim()) {
      const newEssay = createNewEssay(title);
      setEssayData(newEssay);
      setIsNewEssay(false);
    }
    
    // Update the step data
    if (data) {
      data.step1 = {
        goal: goal || "",
        workspace: workspace || "",
        timeManagement: timeManagement || ""
      };
      
      // Update title if changed
      if (data.essay.title !== title && title.trim()) {
        data.essay.title = title;
      }
      
      saveEssayData(data);
    }
  };

  return (
    <StepLayout 
      step={1} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={!!title.trim()}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Why Write?</CardTitle>
            <CardDescription>
              Writing is a way to clarify and articulate your thoughts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              "Writing is thinking in slow motion. When you write, you think more 
              carefully, consider alternatives, and express yourself more precisely. 
              The quality of your thinking improves when you force yourself to write."
              - Jordan B. Peterson
            </p>
            <p className="text-slate-600">
              "Finished beats perfect. A complete essay that's imperfect is better 
              than a perfect essay that's never completed. Write, revise, and learn."
            </p>
          </CardContent>
        </Card>
        
        <div>
          <Label htmlFor="essay-goal" className="text-base">
            What's your goal for this essay? (Optional)
          </Label>
          <div className="mt-1.5">
            <Input
              id="essay-goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., To explore the concept of personal responsibility"
              className="text-base"
            />
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step1;
