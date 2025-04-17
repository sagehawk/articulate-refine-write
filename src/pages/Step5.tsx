import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step5Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Step5 = () => {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [outlineSentences, setOutlineSentences] = useState<string[]>([]);
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [wordCounts, setWordCounts] = useState<number[]>([]);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        // Load outline sentences from step 4
        if (data.step4?.outlineSentences) {
          setOutlineSentences(data.step4.outlineSentences);
          
          // Initialize paragraphs array based on outline sentences
          if (data.step5?.paragraphs) {
            // If we have existing paragraphs, use them
            setParagraphs(data.step5.paragraphs);
            // Calculate word counts for existing paragraphs
            setWordCounts(data.step5.paragraphs.map(countWords));
          } else {
            // Otherwise initialize empty paragraphs matching the outline length
            const emptyParagraphs = Array(data.step4.outlineSentences.length).fill("");
            setParagraphs(emptyParagraphs);
            setWordCounts(Array(emptyParagraphs.length).fill(0));
          }
        }
      }
    }
  }, []);

  const countWords = (text: string): number => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleParagraphChange = (index: number, value: string) => {
    const newParagraphs = [...paragraphs];
    newParagraphs[index] = value;
    setParagraphs(newParagraphs);
    
    // Update word count for this paragraph
    const newWordCounts = [...wordCounts];
    newWordCounts[index] = countWords(value);
    setWordCounts(newWordCounts);
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      data.step5 = {
        paragraphs: paragraphs
      };
      
      saveEssayData(data);
    }
  };

  // Consider a paragraph complete if it has at least 50 words
  const completedParagraphs = wordCounts.filter(count => count >= 50).length;
  const totalParagraphs = outlineSentences.length;
  const progress = totalParagraphs > 0 ? (completedParagraphs / totalParagraphs) * 100 : 0;

  // Allow proceeding if at least 50% of paragraphs are written
  const canProceed = progress >= 50;

  return (
    <StepLayout 
      step={5} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={canProceed}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Paragraph Drafting
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Expand Your Outline Into Paragraphs</CardTitle>
          <CardDescription>
            Turn each outline sentence into a fully developed paragraph.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Following Peterson's guidance, expand each outline sentence into a full paragraph. 
            Aim for approximately 100 words or 10 sentences per paragraph. 
            Focus on clarity and coherence while elaborating on your main points.
          </p>
          
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-800">Paragraph Writing Tips</AlertTitle>
            <AlertDescription className="text-blue-700">
              • Start with your outline sentence as the topic sentence<br />
              • Add supporting evidence, examples, or explanations<br />
              • Ensure logical flow within the paragraph<br />
              • Aim for 100 words minimum (shown in the word count)<br />
              • You'll need to complete at least half your paragraphs to proceed
            </AlertDescription>
          </Alert>
          
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mb-6 text-center">
            {completedParagraphs} of {totalParagraphs} paragraphs completed ({progress.toFixed(0)}%)
          </p>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {outlineSentences.map((sentence, index) => (
          <div key={index} className="border border-slate-200 rounded-md p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-slate-800">Outline Sentence {index + 1}</h3>
              <span className={`text-sm ${wordCounts[index] >= 100 ? 'text-green-600' : 'text-amber-600'} font-medium`}>
                {wordCounts[index]} {wordCounts[index] === 1 ? 'word' : 'words'}
              </span>
            </div>
            
            <p className="text-slate-700 italic mb-3 p-2 bg-slate-50 rounded border border-slate-100">
              {sentence}
            </p>
            
            <Textarea
              value={paragraphs[index] || ""}
              onChange={(e) => handleParagraphChange(index, e.target.value)}
              placeholder="Write your paragraph here..."
              className="min-h-[200px] text-slate-700"
            />
          </div>
        ))}
        
        {outlineSentences.length === 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-amber-800">
                You need to create outline sentences in Step 4 before you can write paragraphs. 
                Please go back to Step 4 to create your outline.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </StepLayout>
  );
};

export default Step5;
