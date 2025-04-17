
import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step6Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";

const Step6 = () => {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);
  const [selectedSentence, setSelectedSentence] = useState<string>("");
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(-1);
  const [editedSentence, setEditedSentence] = useState<string>("");
  const [sentencesInParagraph, setSentencesInParagraph] = useState<string[]>([]);
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [editHistory, setEditHistory] = useState<{
    paragraphIndex: number;
    originalSentence: string;
    newSentence: string;
    timestamp: number;
  }[]>([]);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        // Load paragraphs from step 5
        if (data.step5?.paragraphs && data.step5.paragraphs.length > 0) {
          setParagraphs(data.step5.paragraphs);
          setActiveParagraphIndex(0);
          
          // Initialize sentences for the first paragraph
          splitParagraphIntoSentences(data.step5.paragraphs[0], 0);
        }
        
        // Load edit history if it exists
        if (data.step6?.editHistory) {
          setEditHistory(data.step6.editHistory);
        }
      }
    }
  }, []);

  // Function to split paragraph text into sentences
  const splitParagraphIntoSentences = (paragraphText: string, paragraphIndex: number) => {
    // Basic sentence splitting (this could be improved with a more sophisticated regex)
    const sentences = paragraphText
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => sentence.trim().length > 0);
    
    setSentencesInParagraph(sentences);
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");
  };

  const handleParagraphSelect = (index: number) => {
    setActiveParagraphIndex(index);
    splitParagraphIntoSentences(paragraphs[index], index);
  };

  const handleSentenceSelect = (sentence: string, index: number) => {
    setSelectedSentence(sentence);
    setSelectedSentenceIndex(index);
    setEditedSentence(sentence);
  };

  const handleSentenceEdit = (value: string) => {
    setEditedSentence(value);
  };

  const applyEditedSentence = () => {
    if (selectedSentenceIndex === -1 || !editedSentence.trim()) return;
    
    // Record edit in history
    const newHistoryEntry = {
      paragraphIndex: activeParagraphIndex,
      originalSentence: selectedSentence,
      newSentence: editedSentence,
      timestamp: Date.now()
    };
    
    const newEditHistory = [...editHistory, newHistoryEntry];
    setEditHistory(newEditHistory);
    
    // Update the paragraph with the edited sentence
    const newSentences = [...sentencesInParagraph];
    newSentences[selectedSentenceIndex] = editedSentence;
    
    // Join sentences back into paragraph
    const updatedParagraphText = newSentences.join(" ");
    
    // Update paragraphs array
    const newParagraphs = [...paragraphs];
    newParagraphs[activeParagraphIndex] = updatedParagraphText;
    setParagraphs(newParagraphs);
    
    // Refresh the sentences display
    setSentencesInParagraph(newSentences);
    
    // Clear selection
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");
    
    // Show success message
    toast("Sentence updated", {
      description: "Your edited sentence has been applied to the paragraph.",
      duration: 3000,
    });
  };

  const handleAIAssist = () => {
    // In a real implementation, this would call an AI service
    // For now, just show a toast
    toast("AI Assistance", {
      description: "AI suggestions would appear here. This feature will be implemented in a future update.",
      duration: 3000,
    });
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      // Save the current paragraphs to both step5 and as the basis for step6
      if (!data.step5) {
        data.step5 = { paragraphs: [] };
      }
      data.step5.paragraphs = [...paragraphs];
      
      // Save edit history
      data.step6 = {
        editHistory: editHistory
      };
      
      saveEssayData(data);
    }
  };

  // Calculate progress based on edits made
  const totalParagraphs = paragraphs.length;
  const paragraphsEdited = new Set(editHistory.map(edit => edit.paragraphIndex)).size;
  const progress = totalParagraphs > 0 ? (paragraphsEdited / totalParagraphs) * 100 : 0;
  
  // Allow proceeding if edits have been made to at least 3 sentences
  const canProceed = editHistory.length >= 3;

  return (
    <StepLayout 
      step={6} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={canProceed}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Sentence Editing & Refinement
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Refine Your Writing at the Sentence Level</CardTitle>
          <CardDescription>
            Polish each sentence for clarity, conciseness, and impact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Following Peterson's method, refine your writing by editing individual sentences. 
            Select sentences to edit, focusing on clarity and precision.
            You need to edit at least 3 sentences to proceed.
          </p>
          
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mb-6 text-center">
            {paragraphsEdited} of {totalParagraphs} paragraphs edited ({progress.toFixed(0)}%)
            <br />
            <span className="text-xs">
              {editHistory.length} total sentence edits made
            </span>
          </p>
        </CardContent>
      </Card>

      {paragraphs.length === 0 ? (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <p className="text-amber-800">
              You need to write paragraphs in Step 5 before you can edit sentences. 
              Please go back to Step 5 to draft your paragraphs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs 
          defaultValue={`paragraph-0`} 
          className="w-full"
          onValueChange={(value) => {
            const index = parseInt(value.split('-')[1]);
            handleParagraphSelect(index);
          }}
        >
          <TabsList className="mb-4 flex flex-wrap h-auto pb-1 gap-1">
            {paragraphs.map((_, index) => (
              <TabsTrigger 
                key={index} 
                value={`paragraph-${index}`}
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                Paragraph {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {paragraphs.map((paragraph, pIndex) => (
            <TabsContent key={pIndex} value={`paragraph-${pIndex}`} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mb-4">
                <h3 className="font-medium text-slate-700 mb-2">Current Paragraph</h3>
                <div>
                  {sentencesInParagraph.map((sentence, sIndex) => (
                    <span 
                      key={sIndex}
                      onClick={() => handleSentenceSelect(sentence, sIndex)}
                      className={`inline cursor-pointer ${
                        selectedSentenceIndex === sIndex 
                          ? 'bg-blue-100 border-b-2 border-blue-400' 
                          : 'hover:bg-slate-100'
                      } px-1 py-0.5 rounded`}
                    >
                      {sentence}{' '}
                    </span>
                  ))}
                </div>
              </div>
              
              {selectedSentenceIndex !== -1 && (
                <div className="bg-white p-4 rounded-md border border-slate-200">
                  <div className="mb-4">
                    <h3 className="font-medium text-slate-700 mb-2">Original Sentence</h3>
                    <p className="text-slate-600 italic bg-slate-50 p-2 rounded">
                      {selectedSentence}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-slate-700 mb-2">Edited Sentence</h3>
                    <Textarea
                      value={editedSentence}
                      onChange={(e) => handleSentenceEdit(e.target.value)}
                      placeholder="Rewrite the sentence here..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={applyEditedSentence} className="space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Apply Edit</span>
                    </Button>
                    <Button variant="outline" onClick={handleAIAssist} className="space-x-1">
                      <Wand2 className="w-4 h-4" />
                      <span>Get AI Suggestions</span>
                    </Button>
                  </div>
                </div>
              )}
              
              {editHistory.filter(edit => edit.paragraphIndex === pIndex).length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-slate-700 mb-2">Edit History</h3>
                  <div className="bg-white rounded-md border border-slate-200 divide-y divide-slate-100">
                    {editHistory
                      .filter(edit => edit.paragraphIndex === pIndex)
                      .map((edit, index) => (
                        <div key={index} className="p-3">
                          <div className="flex items-center text-xs text-slate-500 mb-1">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            <span>{new Date(edit.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <div className="text-sm">
                              <span className="text-red-500 line-through">{edit.originalSentence}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-green-600">{edit.newSentence}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </StepLayout>
  );
};

export default Step6;
