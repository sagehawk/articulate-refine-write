import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step7Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, ArrowDown, ArrowUp, GripVertical, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Step7 = () => {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [paragraphOrder, setParagraphOrder] = useState<number[]>([]);
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [originalOrder, setOriginalOrder] = useState<number[]>([]);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        // Load paragraphs from step 5/6
        if (data.step5?.paragraphs && data.step5.paragraphs.length > 0) {
          setParagraphs(data.step5.paragraphs);
          
          // If we have a saved order, use it
          if (data.step7?.paragraphOrder) {
            setParagraphOrder(data.step7.paragraphOrder);
            setOriginalOrder([...data.step7.paragraphOrder]);
          } else {
            // Otherwise initialize with sequential order
            const initialOrder = Array.from(
              { length: data.step5.paragraphs.length }, 
              (_, i) => i
            );
            setParagraphOrder(initialOrder);
            setOriginalOrder([...initialOrder]);
          }
        }
      }
    }
  }, []);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newOrder = [...paragraphOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setParagraphOrder(newOrder);
    
    // Update essay data in real-time
    if (essayData) {
      updateEssayWithNewOrder(newOrder);
      const data = { ...essayData };
      data.step7 = { paragraphOrder: newOrder };
      saveEssayData(data);
      setEssayData(data); // Update essayData state to trigger refresh
    }
  };
  
  const handleMoveDown = (index: number) => {
    if (index === paragraphOrder.length - 1) return;
    
    const newOrder = [...paragraphOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setParagraphOrder(newOrder);
    
    // Update essay data in real-time
    if (essayData) {
      updateEssayWithNewOrder(newOrder);
      const data = { ...essayData };
      data.step7 = { paragraphOrder: newOrder };
      saveEssayData(data);
      setEssayData(data); // Update essayData state to trigger refresh
    }
  };
  
  const updateEssayWithNewOrder = (newOrder: number[]) => {
    if (!essayData || !essayData.step5 || !essayData.step5.paragraphs) return;
    
    // Create reordered paragraphs
    const reorderedParagraphs = newOrder.map(originalIndex => 
      paragraphs[originalIndex]
    );
    
    // Update essayData with reordered paragraphs
    essayData.step5.paragraphs = reorderedParagraphs;
    
    // Store the paragraph order in step7
    if (!essayData.step7) {
      essayData.step7 = { paragraphOrder: newOrder };
    } else {
      essayData.step7.paragraphOrder = newOrder;
    }
  };

  const resetOrder = () => {
    setParagraphOrder([...originalOrder]);
    
    // Update essay data with original order
    if (essayData) {
      const data = { ...essayData };
      updateEssayWithNewOrder([...originalOrder]);
      data.step7 = { paragraphOrder: [...originalOrder] };
      saveEssayData(data);
      setEssayData(data); // Update essayData state to trigger refresh
    }
    
    toast("Order Reset", {
      description: "Paragraph order has been reset to original.",
    });
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      data.step7 = {
        paragraphOrder: paragraphOrder
      };
      
      saveEssayData(data);
    }
  };

  const hasReordered = JSON.stringify(paragraphOrder) !== JSON.stringify(originalOrder);
  
  const canProceed = paragraphs.length > 0;

  const getParagraphPreview = (paragraph: string) => {
    if (!paragraph) return "Empty paragraph";
    const preview = paragraph.substring(0, 100);
    return preview + (paragraph.length > 100 ? "..." : "");
  };

  return (
    <StepLayout 
      step={7} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={canProceed}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Paragraph Reordering
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Optimize the Flow of Your Essay</CardTitle>
          <CardDescription>
            Arrange your paragraphs in the most logical and persuasive order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            According to Peterson, the order of your paragraphs significantly impacts how 
            your reader follows your argument. Use the up and down arrows to reorder your paragraphs 
            to create the most compelling flow of ideas.
          </p>
          
          {hasReordered && (
            <div className="flex items-center justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetOrder}
                className="text-sm space-x-1"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>Reset Order</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {paragraphs.length === 0 ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to write paragraphs in Step 5 before you can reorder them.
            Please go back to Step 5 to draft your paragraphs.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {paragraphOrder.map((originalIndex, currentIndex) => (
            <div 
              key={originalIndex}
              className="flex items-stretch border border-slate-200 bg-white rounded-md overflow-hidden"
            >
              <div className="flex flex-col justify-center bg-slate-50 px-2 py-4 border-r border-slate-200">
                <GripVertical className="mx-auto h-5 w-5 text-slate-400 mb-2" />
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleMoveUp(currentIndex)}
                    disabled={currentIndex === 0}
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveDown(currentIndex)}
                    disabled={currentIndex === paragraphOrder.length - 1}
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                    Paragraph {originalIndex + 1}
                  </span>
                  <span className="text-sm text-slate-500">
                    (Now position {currentIndex + 1})
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {getParagraphPreview(paragraphs[originalIndex])}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </StepLayout>
  );
};

export default Step7;
