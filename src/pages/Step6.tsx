import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step6Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, RefreshCw, Trash2, Wand2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { getAISuggestions } from "@/utils/aiSuggestions";
import { AISuggestionsModal } from "@/components/essay/AISuggestionsModal";

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

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        if (data.step5?.paragraphs && data.step5.paragraphs.length > 0) {
          setParagraphs(data.step5.paragraphs);
          setActiveParagraphIndex(0);
          
          splitParagraphIntoSentences(data.step5.paragraphs[0], 0);
        }
        
        if (data.step6?.editHistory) {
          setEditHistory(data.step6.editHistory);
        }
      }
    }
  }, []);

  const splitParagraphIntoSentences = (paragraphText: string, paragraphIndex: number) => {
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
    
    const newHistoryEntry = {
      paragraphIndex: activeParagraphIndex,
      originalSentence: selectedSentence,
      newSentence: editedSentence,
      timestamp: Date.now()
    };
    
    const newEditHistory = [...editHistory, newHistoryEntry];
    setEditHistory(newEditHistory);
    
    const newSentences = [...sentencesInParagraph];
    newSentences[selectedSentenceIndex] = editedSentence;
    
    const updatedParagraphText = newSentences.join(" ");
    
    const newParagraphs = [...paragraphs];
    newParagraphs[activeParagraphIndex] = updatedParagraphText;
    setParagraphs(newParagraphs);
    
    setSentencesInParagraph(newSentences);
    
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");
    
    toast("Sentence updated", {
      description: "Your edited sentence has been applied to the paragraph.",
    });
  };

  const handleSentenceDelete = () => {
    if (selectedSentenceIndex === -1) return;
    
    const newHistoryEntry = {
      paragraphIndex: activeParagraphIndex,
      originalSentence: selectedSentence,
      newSentence: "",
      timestamp: Date.now()
    };
    
    const newEditHistory = [...editHistory, newHistoryEntry];
    setEditHistory(newEditHistory);
    
    const newSentences = [...sentencesInParagraph];
    newSentences.splice(selectedSentenceIndex, 1);
    
    const updatedParagraphText = newSentences.length > 0 
      ? newSentences.join(" ") 
      : "";
    
    const newParagraphs = [...paragraphs];
    newParagraphs[activeParagraphIndex] = updatedParagraphText;
    setParagraphs(newParagraphs);
    
    setSentencesInParagraph(newSentences);
    
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");
    
    toast("Sentence deleted", {
      description: "The selected sentence has been removed from the paragraph.",
    });
  };

  const handleSentenceMove = (direction: 'up' | 'down') => {
    if (selectedSentenceIndex === -1) return;
    if (direction === 'up' && selectedSentenceIndex === 0) return;
    if (direction === 'down' && selectedSentenceIndex === sentencesInParagraph.length - 1) return;
    
    const newSentences = [...sentencesInParagraph];
    const newIndex = direction === 'up' ? selectedSentenceIndex - 1 : selectedSentenceIndex + 1;
    
    [newSentences[selectedSentenceIndex], newSentences[newIndex]] = 
      [newSentences[newIndex], newSentences[selectedSentenceIndex]];
    
    const updatedParagraphText = newSentences.join(" ");
    
    const newParagraphs = [...paragraphs];
    newParagraphs[activeParagraphIndex] = updatedParagraphText;
    setParagraphs(newParagraphs);
    
    setSentencesInParagraph(newSentences);
    setSelectedSentence(newSentences[newIndex]);
    setSelectedSentenceIndex(newIndex);
    setEditedSentence(newSentences[newIndex]);
    
    const newHistoryEntry = {
      paragraphIndex: activeParagraphIndex,
      originalSentence: `Sentence moved ${direction}`,
      newSentence: selectedSentence,
      timestamp: Date.now()
    };
    
    setEditHistory([...editHistory, newHistoryEntry]);
    
    toast(`Sentence moved ${direction}`, {
      description: "The sentence order has been updated.",
    });
  };

  const handleAISuggestions = async () => {
    if (!selectedSentence) return;

    setIsLoadingSuggestions(true);
    setIsAIModalOpen(true);
    setAiSuggestions([]);

    try {
      const suggestions = await getAISuggestions(selectedSentence);
      setAiSuggestions(suggestions);
    } catch (error) {
      toast.error("Failed to get AI suggestions", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
      setIsAIModalOpen(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      if (!data.step5) {
        data.step5 = { paragraphs: [] };
      }
      data.step5.paragraphs = [...paragraphs];
      
      data.step6 = {
        editHistory: editHistory
      };
      
      saveEssayData(data);
    }
  };

  const totalParagraphs = paragraphs.length;
  const paragraphsEdited = new Set(editHistory.map(edit => edit.paragraphIndex)).size;
  const progress = totalParagraphs > 0 ? (paragraphsEdited / totalParagraphs) * 100 : 0;
  
  const canProceed = editHistory.length >= 3;

  return (
    <StepLayout 
      step={6} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={canProceed}
    >
      <h2 className="text-2xl font-nunito font-bold text-blue-800 mb-6">
        Sentence Editing & Refinement
      </h2>

      <Card className="mb-8 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
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
              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-300"
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
          <TabsList className="mb-4 flex flex-wrap h-auto pb-1 gap-1 bg-blue-50">
            {paragraphs.map((_, index) => (
              <TabsTrigger 
                key={index} 
                value={`paragraph-${index}`}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Paragraph {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {paragraphs.map((paragraph, pIndex) => (
            <TabsContent key={pIndex} value={`paragraph-${pIndex}`} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-md border border-blue-100 mb-4">
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
                <div className="bg-white p-4 rounded-md border border-blue-100 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-medium text-slate-700 mb-2">Original Sentence</h3>
                    <p className="text-slate-600 italic bg-slate-50 p-2 rounded border-l-2 border-blue-300">
                      {selectedSentence}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-medium text-slate-700 mb-2">Edited Sentence</h3>
                    <Textarea
                      value={editedSentence}
                      onChange={(e) => handleSentenceEdit(e.target.value)}
                      placeholder="Rewrite the sentence here..."
                      className="min-h-[100px] border-blue-100 focus-visible:ring-blue-400"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={applyEditedSentence} className="space-x-1 bg-blue-600 hover:bg-blue-700">
                      <Check className="w-4 h-4" />
                      <span>Apply Edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleAISuggestions}
                      className="space-x-1 border-blue-200 hover:bg-blue-50"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Get AI Suggestions</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSentenceMove('up')}
                      disabled={selectedSentenceIndex === 0}
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSentenceMove('down')}
                      disabled={selectedSentenceIndex === sentencesInParagraph.length - 1}
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleSentenceDelete}
                      className="space-x-1 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              )}
              
              {editHistory.filter(edit => edit.paragraphIndex === pIndex).length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-slate-700 mb-2">Edit History</h3>
                  <div className="bg-white rounded-md border border-blue-100 divide-y divide-blue-50">
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
                              {edit.newSentence ? (
                                <span className="text-green-600">{edit.newSentence}</span>
                              ) : (
                                <span className="text-orange-500 italic">(Sentence deleted)</span>
                              )}
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

      <AISuggestionsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        originalSentence={selectedSentence}
        onSelectSuggestion={handleSentenceEdit} // Or however you want to apply the suggestion
        suggestions={aiSuggestions}
        isLoading={isLoadingSuggestions}
      />
    </StepLayout>
  );
};

export default Step6;
