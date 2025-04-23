import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step4Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Step4 = () => {
  const [outlineSentences, setOutlineSentences] = useState<string[]>(Array(15).fill(""));
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        if (data.step4?.outlineSentences) {
          // Fill the existing sentences and pad with empty strings to reach 15
          const existingSentences = [...data.step4.outlineSentences];
          while (existingSentences.length < 15) {
            existingSentences.push("");
          }
          setOutlineSentences(existingSentences);
        }
        
        setIsInitialLoad(false);
      }
    }
  }, []);

  // Listen for changes to essayData from StepLayout
  useEffect(() => {
    if (!isInitialLoad && essayData?.step4?.outlineSentences) {
      const currentOutline = outlineSentences.filter(s => s.trim() !== "");
      const updatedOutline = essayData.step4.outlineSentences;
      
      // Only update if outlines are different
      if (JSON.stringify(currentOutline) !== JSON.stringify(updatedOutline)) {
        const newOutline = [...updatedOutline];
        while (newOutline.length < 15) {
          newOutline.push("");
        }
        setOutlineSentences(newOutline);
      }
    }
  }, [essayData, isInitialLoad]);

  const handleSentenceChange = (index: number, value: string) => {
    const newOutlineSentences = [...outlineSentences];
    newOutlineSentences[index] = value;
    setOutlineSentences(newOutlineSentences);
    
    // Update essay content in real-time based on outline
    if (essayData) {
      updateEssayFromOutline(newOutlineSentences, essayData);
      
      // Create step4 data if it doesn't exist
      if (!essayData.step4) {
        essayData.step4 = {
          outlineSentences: []
        };
      }
      
      // Update the outlineSentences in real-time
      essayData.step4.outlineSentences = newOutlineSentences.filter(sentence => sentence.trim() !== "");
    }
  };

  const updateEssayFromOutline = (sentences: string[], data: EssayData) => {
    // Filter out empty sentences
    const filteredSentences = sentences.filter(sentence => sentence.trim() !== "");
    
    // Check if we have existing paragraphs to preserve
    const existingParagraphs = data.step5?.paragraphs || [];
    
    // Create or update paragraphs from outline sentences
    const updatedParagraphs = filteredSentences.map((sentence, index) => {
      // Try to preserve the existing paragraph content if it exists
      if (existingParagraphs[index]) {
        // If the paragraph already starts with this sentence, keep it intact
        if (existingParagraphs[index].startsWith(sentence)) {
          return existingParagraphs[index];
        }
        
        // Otherwise, replace the first sentence of the paragraph
        const restOfParagraph = existingParagraphs[index].replace(/^.+?[.!?](?:\s|$)/g, '').trim();
        return `${sentence} ${restOfParagraph}`;
      }
      
      // Create a new paragraph if none exists
      return `${sentence} [Expand on this point further...]`;
    });
    
    // Create step5 data if it doesn't exist
    if (!data.step5) {
      data.step5 = {
        paragraphs: []
      };
    }
    
    // Update paragraphs
    data.step5.paragraphs = updatedParagraphs;
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      // Filter out empty sentences
      const filteredSentences = outlineSentences.filter(sentence => sentence.trim() !== "");
      
      data.step4 = {
        outlineSentences: filteredSentences
      };
      
      // Also update the essay content when saving
      updateEssayFromOutline(outlineSentences, data);
      
      saveEssayData(data);
    }
  };

  // Check if we have at least one non-empty outline sentence
  const hasOutline = outlineSentences.some(sentence => sentence.trim() !== "");

  return (
    <StepLayout 
      step={4} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={hasOutline}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Outline Creation
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Creating Your Essay Outline</CardTitle>
          <CardDescription>
            Peterson emphasizes that a clear outline is the skeleton of your essay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Write 10-15 sentences that form the core argument of your essay. These sentences will become the 
            backbone of your essay, with each sentence potentially expanding into a paragraph in the next step.
          </p>
          
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-700">
              You can also create your outline by writing directly in the Essay Content area. 
              The first sentence of each paragraph will automatically become an outline sentence.
            </AlertDescription>
          </Alert>
          
          <p className="text-slate-600 mb-4">
            Focus on clarity and logical flow. Each sentence should connect meaningfully to the ones before and after it.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {outlineSentences.map((sentence, index) => (
          <div key={index} className="flex items-center">
            <span className="text-slate-500 font-medium w-6">{index + 1}.</span>
            <Input
              value={sentence}
              onChange={(e) => handleSentenceChange(index, e.target.value)}
              placeholder={`Outline sentence ${index + 1}`}
              className="ml-2"
            />
          </div>
        ))}
      </div>
    </StepLayout>
  );
};

export default Step4;
