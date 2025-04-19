import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, ArrowUp, Check, GripVertical, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { getAISuggestions } from "@/utils/aiSuggestions";
import { AISuggestionsModal } from "./AISuggestionsModal";

interface RefactoringToolsProps {
  paragraphs: string[];
  onParagraphsChange: (paragraphs: string[]) => void;
  initialEditHistory?: { 
    paragraphIndex: number;
    originalSentence: string;
    newSentence: string;
    timestamp: number;
  }[];
  onEditHistoryChange?: (history: any[]) => void;
}

export function RefactoringTools({ 
  paragraphs, 
  onParagraphsChange,
  initialEditHistory = [],
  onEditHistoryChange
}: RefactoringToolsProps) {
  const [activeTab, setActiveTab] = useState("sentences");
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(0);
  const [paragraphOrder, setParagraphOrder] = useState<number[]>([]);
  const [selectedSentence, setSelectedSentence] = useState<string>("");
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number>(-1);
  const [editedSentence, setEditedSentence] = useState<string>("");
  const [sentencesInParagraph, setSentencesInParagraph] = useState<string[]>([]);
  const [editHistory, setEditHistory] = useState<{
    paragraphIndex: number;
    originalSentence: string;
    newSentence: string;
    timestamp: number;
  }[]>(initialEditHistory);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (paragraphs.length) {
      const initialOrder = Array.from({ length: paragraphs.length }, (_, i) => i);
      setParagraphOrder(initialOrder);
      
      setActiveParagraphIndex(0);
      splitParagraphIntoSentences(paragraphs[0], 0);
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
    splitParagraphIntoSentences(paragraphs[paragraphOrder[index]], paragraphOrder[index]);
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
      paragraphIndex: paragraphOrder[activeParagraphIndex],
      originalSentence: selectedSentence,
      newSentence: editedSentence,
      timestamp: Date.now()
    };
    
    const newEditHistory = [...editHistory, newHistoryEntry];
    setEditHistory(newEditHistory);
    
    if (onEditHistoryChange) {
      onEditHistoryChange(newEditHistory);
    }
    
    const newSentences = [...sentencesInParagraph];
    newSentences[selectedSentenceIndex] = editedSentence;
    
    const updatedParagraphText = newSentences.join(" ");
    
    const newParagraphs = [...paragraphs];
    newParagraphs[paragraphOrder[activeParagraphIndex]] = updatedParagraphText;
    onParagraphsChange(newParagraphs);
    
    setSentencesInParagraph(newSentences);
    
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");
    
    toast("Sentence updated", {
      description: "Your edited sentence has been applied to the paragraph.",
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newOrder = [...paragraphOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setParagraphOrder(newOrder);
  };
  
  const handleMoveDown = (index: number) => {
    if (index === paragraphOrder.length - 1) return;
    
    const newOrder = [...paragraphOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setParagraphOrder(newOrder);
  };

  const applyReordering = () => {
    const reorderedParagraphs = paragraphOrder.map(index => paragraphs[index]);
    onParagraphsChange(reorderedParagraphs);
    
    const initialOrder = Array.from({ length: reorderedParagraphs.length }, (_, i) => i);
    setParagraphOrder(initialOrder);
    
    toast("Paragraphs reordered", {
      description: "Your paragraphs have been reordered successfully.",
    });
  };

  const getParagraphPreview = (paragraph: string) => {
    if (!paragraph) return "Empty paragraph";
    const preview = paragraph.substring(0, 100);
    return preview + (paragraph.length > 100 ? "..." : "");
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

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList>
        <TabsTrigger value="sentences">Sentence Editing</TabsTrigger>
        <TabsTrigger value="paragraphs">Paragraph Reordering</TabsTrigger>
      </TabsList>
      
      <TabsContent value="sentences" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Refine Sentences</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue={`paragraph-0`} 
              className="w-full"
              onValueChange={(value) => {
                const index = parseInt(value.split('-')[1]);
                handleParagraphSelect(index);
              }}
            >
              <TabsList className="mb-4 flex flex-wrap h-auto pb-1 gap-1">
                {paragraphOrder.map((_, index) => (
                  <TabsTrigger 
                    key={index} 
                    value={`paragraph-${index}`}
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    Paragraph {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {paragraphOrder.map((pIndex, currentIndex) => (
                <TabsContent key={currentIndex} value={`paragraph-${currentIndex}`} className="space-y-4">
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
                        <Button variant="outline" onClick={handleAISuggestions} className="space-x-1 border-blue-200 hover:bg-blue-50" disabled={!selectedSentence}>
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
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="paragraphs" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Reorder Paragraphs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <Button onClick={applyReordering}>Apply Reordering</Button>
            </div>
            
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
          </CardContent>
        </Card>
      </TabsContent>
      
      <AISuggestionsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        originalSentence={selectedSentence}
        onSelectSuggestion={handleSentenceEdit}
        suggestions={aiSuggestions}
        isLoading={isLoadingSuggestions}
      />
    </Tabs>
  );
}
