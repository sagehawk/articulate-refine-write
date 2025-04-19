import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step8Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, ArrowDown, ArrowUp, Eye, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefactoringTools } from "@/components/essay/RefactoringTools";

const Step8 = () => {
  const [originalParagraphs, setOriginalParagraphs] = useState<string[]>([]);
  const [orderedParagraphs, setOrderedParagraphs] = useState<string[]>([]);
  const [newOutlineSentences, setNewOutlineSentences] = useState<string[]>(Array(10).fill(""));
  const [newParagraphs, setNewParagraphs] = useState<string[]>([]);
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [viewingDraft, setViewingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("outline");
  const [editHistory, setEditHistory] = useState<{
    paragraphIndex: number;
    originalSentence: string;
    newSentence: string;
    timestamp: number;
  }[]>([]);
  const [showRefactoring, setShowRefactoring] = useState(false);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        // Load paragraphs from previous steps
        if (data.step5?.paragraphs && data.step5.paragraphs.length > 0) {
          // Store original paragraphs
          setOriginalParagraphs(data.step5.paragraphs);
          
          // If we have paragraph order from step 7, use it to order paragraphs
          if (data.step7?.paragraphOrder) {
            const ordered = data.step7.paragraphOrder.map(index => data.step5!.paragraphs[index]);
            setOrderedParagraphs(ordered);
          } else {
            // Otherwise use the original order
            setOrderedParagraphs([...data.step5.paragraphs]);
          }
        }
        
        // Load previously saved data for this step if it exists
        if (data.step8) {
          if (data.step8.newOutlineSentences) {
            setNewOutlineSentences(data.step8.newOutlineSentences);
          }
          
          if (data.step8.newParagraphs) {
            setNewParagraphs(data.step8.newParagraphs);
          }

          if (data.step8.editHistory) {
            setEditHistory(data.step8.editHistory);
          }
        } else {
          // Initialize newParagraphs as empty array matching the expected length
          setNewParagraphs([]);
        }
      }
    }
  }, []);

  const handleOutlineSentenceChange = (index: number, value: string) => {
    const newSentences = [...newOutlineSentences];
    newSentences[index] = value;
    setNewOutlineSentences(newSentences);
  };

  const addOutlineSentence = () => {
    setNewOutlineSentences([...newOutlineSentences, ""]);
  };

  const removeOutlineSentence = (index: number) => {
    const newSentences = [...newOutlineSentences];
    newSentences.splice(index, 1);
    setNewOutlineSentences(newSentences);
  };

  const toggleViewDraft = () => {
    setViewingDraft(!viewingDraft);
  };

  // This function now doesn't update state directly, but returns new paragraph if needed
  const getOrCreateParagraph = (index: number) => {
    if (!newParagraphs[index]) {
      return "";
    }
    return newParagraphs[index];
  };

  // Create a separate useEffect to initialize paragraphs when switching to restructure tab
  useEffect(() => {
    if (activeTab === "restructure") {
      const filledOutlines = newOutlineSentences.filter(s => s.trim());
      
      if (filledOutlines.length > 0 && newParagraphs.length < filledOutlines.length) {
        // Only update if we need to add more paragraphs
        const initialParagraphs = [...newParagraphs];
        
        // Add empty paragraphs for any missing outline points
        while (initialParagraphs.length < filledOutlines.length) {
          initialParagraphs.push("");
        }
        
        setNewParagraphs(initialParagraphs);
      }
    }
  }, [activeTab, newOutlineSentences, newParagraphs]);

  const handleParagraphChange = (index: number, value: string) => {
    const updatedParagraphs = [...newParagraphs];
    updatedParagraphs[index] = value;
    setNewParagraphs(updatedParagraphs);
  };

  const handleRefactoringParagraphsChange = (updatedParagraphs: string[]) => {
    setNewParagraphs(updatedParagraphs);
  };

  const handleEditHistoryChange = (history: any[]) => {
    setEditHistory(history);
  };

  const handleGenerateOutlineClick = () => {
    setActiveTab("restructure");
    
    toast("Ready to restructure", {
      description: "Your new outline has been prepared. Now you can write paragraphs for each point.",
    });
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      // Filter out empty outline sentences
      const filteredOutline = newOutlineSentences.filter(sentence => sentence.trim());
      
      data.step8 = {
        newOutlineSentences: filteredOutline,
        newParagraphs: newParagraphs,
        editHistory: editHistory
      };
      
      saveEssayData(data);
      toast("Progress Saved", {
        description: "Your new outline and paragraphs have been saved.",
      });
    }
  };

  // Allow proceeding if there's at least one outline sentence and one paragraph
  const hasOutline = newOutlineSentences.some(s => s.trim());
  const hasParagraphs = newParagraphs.some(p => p.trim());
  const canProceed = hasOutline && hasParagraphs;

  return (
    <StepLayout 
      step={8} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={canProceed}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Generate New Outline & Restructure
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Refine Your Essay Structure</CardTitle>
          <CardDescription>
            Create a new outline from memory and restructure your content accordingly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Peterson emphasizes that an important step in refining your essay is to create a new outline 
            from memory after completing your draft, then restructure your content to match this improved outline. 
            This often leads to a clearer, more persuasive structure.
          </p>
        </CardContent>
      </Card>

      {originalParagraphs.length === 0 ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to write paragraphs in previous steps before you can restructure your essay.
            Please go back to Step 5 to draft your paragraphs.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList>
            <TabsTrigger value="outline">1. Create New Outline</TabsTrigger>
            <TabsTrigger value="restructure">2. Restructure Essay</TabsTrigger>
            {showRefactoring || newParagraphs.length > 0 ? (
              <TabsTrigger value="refine">3. Refine & Polish</TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="outline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Outline</CardTitle>
                <CardDescription>
                  Write a new outline from memory without looking at your previous draft.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    variant="outline" 
                    onClick={toggleViewDraft}
                    className="space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{viewingDraft ? "Hide Draft" : "View Original Draft"}</span>
                  </Button>
                  
                  {hasOutline && (
                    <Button 
                      onClick={handleGenerateOutlineClick}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Proceed to Restructure
                    </Button>
                  )}
                </div>

                {viewingDraft && (
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50 mb-6 max-h-64 overflow-y-auto">
                    <h3 className="font-medium text-slate-800 mb-2">Your Current Draft</h3>
                    {orderedParagraphs.map((paragraph, index) => (
                      <p key={index} className="text-sm text-slate-700 mb-4">{paragraph}</p>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-medium text-slate-800">New Outline Sentences</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Write 8-10 sentences that form your new outline. Try to do this from memory
                    rather than copying your original outline.
                  </p>
                  
                  {newOutlineSentences.map((sentence, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium w-6">{index + 1}.</span>
                      <Input
                        value={sentence}
                        onChange={(e) => handleOutlineSentenceChange(index, e.target.value)}
                        placeholder={`Outline point ${index + 1}`}
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeOutlineSentence(index)}
                        className="h-8 w-8 text-slate-500"
                      >
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </Button>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={addOutlineSentence}
                  >
                    Add Outline Point
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restructure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Restructure Your Essay</CardTitle>
                <CardDescription>
                  Write new paragraphs based on your revised outline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Button 
                    variant="outline" 
                    onClick={toggleViewDraft}
                    className="space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{viewingDraft ? "Hide Draft" : "View Original Draft"}</span>
                  </Button>

                  {newParagraphs.some(p => p.trim()) && (
                    <Button 
                      variant="default" 
                      onClick={() => {
                        setShowRefactoring(true);
                        setActiveTab("refine");
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Proceed to Refine & Polish
                    </Button>
                  )}
                </div>

                {viewingDraft && (
                  <div className="border border-slate-200 rounded-md p-4 bg-slate-50 mb-6 max-h-64 overflow-y-auto">
                    <h3 className="font-medium text-slate-800 mb-2">Your Current Draft</h3>
                    {orderedParagraphs.map((paragraph, index) => (
                      <p key={index} className="text-sm text-slate-700 mb-4">{paragraph}</p>
                    ))}
                  </div>
                )}

                <div className="space-y-6">
                  {newOutlineSentences
                    .filter(sentence => sentence.trim())
                    .map((sentence, index) => {
                      // Get the paragraph value, or an empty string if it doesn't exist yet
                      const paragraphValue = getOrCreateParagraph(index);
                      
                      return (
                        <div key={index} className="border border-slate-200 rounded-md p-4 bg-white">
                          <div className="mb-3">
                            <h3 className="font-medium text-slate-800">Outline Point {index + 1}</h3>
                            <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                              {sentence}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-slate-800 mb-2">New Paragraph</h3>
                            <Textarea
                              value={paragraphValue}
                              onChange={(e) => handleParagraphChange(index, e.target.value)}
                              placeholder="Write your new paragraph based on this outline point..."
                              className="min-h-[200px]"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="refine" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Refine & Polish Your Essay</CardTitle>
                <CardDescription>
                  Fine-tune sentences and paragraph order for maximum clarity and impact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {newParagraphs.length > 0 ? (
                  <RefactoringTools 
                    paragraphs={newParagraphs}
                    onParagraphsChange={handleRefactoringParagraphsChange}
                    initialEditHistory={editHistory}
                    onEditHistoryChange={handleEditHistoryChange}
                  />
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-slate-600">
                      You need to write paragraphs in the "Restructure Essay" tab before refining them.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => setActiveTab("restructure")}
                    >
                      Go to Restructure
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </StepLayout>
  );
};

export default Step8;
