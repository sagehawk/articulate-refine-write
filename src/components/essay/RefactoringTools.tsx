import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, ArrowUp, Check, GripVertical, RefreshCw, Wand2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
    if (paragraphs.length > 0) { // Ensure paragraphs exist before setting up
      const initialOrder = Array.from({ length: paragraphs.length }, (_, i) => i);
      setParagraphOrder(initialOrder);

      // Set initial paragraph index and split sentences
      setActiveParagraphIndex(0);
      splitParagraphIntoSentences(paragraphs[0], 0);
    } else {
        // Handle case where there are no paragraphs initially
        setParagraphOrder([]);
        setActiveParagraphIndex(-1); // Indicate no paragraph is active
        setSentencesInParagraph([]);
    }
  }, [paragraphs]); // Depend on paragraphs so it re-initializes if paragraphs load later or change significantly

  const splitParagraphIntoSentences = (paragraphText: string, paragraphIndex: number) => {
    // Improved regex for sentence splitting
    const sentences = paragraphText
      .split(/(?<!Mr|Mrs|Ms|Dr|Prof|Rev|Capt|Lt|Col|Maj)\.(?!\d)|[!?]\s+/) // Split by . ! ? unless preceded by common titles or followed by a digit
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim()); // Trim whitespace from resulting sentences

    setSentencesInParagraph(sentences);
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");
  };

  const handleParagraphSelect = (index: number) => {
     // Check if index is valid in the current paragraphOrder
    if (index >= 0 && index < paragraphOrder.length) {
        const originalParagraphIndex = paragraphOrder[index];
        setActiveParagraphIndex(index);
        splitParagraphIntoSentences(paragraphs[originalParagraphIndex], originalParagraphIndex);
    }
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
    if (selectedSentenceIndex === -1 || !editedSentence.trim()) {
       toast("No sentence selected or empty edit", { description: "Select a sentence and enter your edit before applying." });
       return;
    }

    const newHistoryEntry = {
      paragraphIndex: paragraphOrder[activeParagraphIndex], // Use the original index
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

    // Create a new array of paragraphs to trigger state update in parent
    const newParagraphs = [...paragraphs];
    newParagraphs[paragraphOrder[activeParagraphIndex]] = updatedParagraphText; // Update the paragraph at its original index

    // Call the parent handler to update the main paragraphs state
    onParagraphsChange(newParagraphs);

    // Update the sentences displayed in the current tab
    setSentencesInParagraph(newSentences);

    // Deselect the sentence after applying
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");

    toast("Sentence updated", {
      description: "Your edited sentence has been applied to the paragraph.",
    });
  };


  const handleSentenceDelete = () => {
      if (selectedSentenceIndex === -1) {
        toast("No sentence selected", { description: "Select a sentence to delete it." });
        return;
    }

    const newHistoryEntry = {
      paragraphIndex: paragraphOrder[activeParagraphIndex], // Use the original index
      originalSentence: selectedSentence,
      newSentence: "", // Indicate deletion
      timestamp: Date.now()
    };

    const newEditHistory = [...editHistory, newHistoryEntry];
    setEditHistory(newEditHistory);

    if (onEditHistoryChange) {
      onEditHistoryChange(newEditHistory);
    }

    const newSentences = sentencesInParagraph.filter((_, index) => index !== selectedSentenceIndex);

    const updatedParagraphText = newSentences.length > 0
      ? newSentences.join(" ") // Join remaining sentences with a space
      : ""; // If no sentences left, the paragraph is empty


    const newParagraphs = [...paragraphs];
    newParagraphs[paragraphOrder[activeParagraphIndex]] = updatedParagraphText; // Update the paragraph at its original index
    onParagraphsChange(newParagraphs);

    setSentencesInParagraph(newSentences);

    // Deselect after deletion
    setSelectedSentence("");
    setSelectedSentenceIndex(-1);
    setEditedSentence("");

    toast("Sentence deleted", {
      description: "The selected sentence has been removed from the paragraph.",
    });
  };

  const handleSentenceMove = (direction: 'up' | 'down') => {
    if (selectedSentenceIndex === -1) {
        toast("No sentence selected", { description: "Select a sentence to move it." });
        return;
    }
    const isFirst = selectedSentenceIndex === 0;
    const isLast = selectedSentenceIndex === sentencesInParagraph.length - 1;

    if ((direction === 'up' && isFirst) || (direction === 'down' && isLast)) {
        // Cannot move further in this direction
        return;
    }

    const newSentences = [...sentencesInParagraph];
    const newIndex = direction === 'up' ? selectedSentenceIndex - 1 : selectedSentenceIndex + 1;

    // Swap elements using destructuring
    [newSentences[selectedSentenceIndex], newSentences[newIndex]] =
      [newSentences[newIndex], newSentences[selectedSentenceIndex]];

    const updatedParagraphText = newSentences.join(" ");

    const newParagraphs = [...paragraphs];
    newParagraphs[paragraphOrder[activeParagraphIndex]] = updatedParagraphText; // Update the paragraph at its original index
    onParagraphsChange(newParagraphs);


    setSentencesInParagraph(newSentences);
    // Update selected state to follow the moved sentence
    setSelectedSentence(newSentences[newIndex]);
    setSelectedSentenceIndex(newIndex);
    setEditedSentence(newSentences[newIndex]);

    // Log this as an edit for tracking progress
    const newHistoryEntry = {
      paragraphIndex: paragraphOrder[activeParagraphIndex], // Use the original index
      originalSentence: `Sentence moved ${direction}`, // Log action
      newSentence: `"${selectedSentence}" moved to position ${newIndex + 1}`, // Log what was moved and where
      timestamp: Date.now()
    };

    const newEditHistory = [...editHistory, newHistoryEntry];
    setEditHistory(newEditHistory);
     if (onEditHistoryChange) {
      onEditHistoryChange(newEditHistory);
    }


    toast(`Sentence moved ${direction}`, {
      description: "The sentence order has been updated.",
    });
  };

  const handleMoveUp = (currentIndex: number) => {
    if (currentIndex === 0) return;

    const newOrder = [...paragraphOrder];
    [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    setParagraphOrder(newOrder);
     // Optionally, save the new order or indicate change
     // For now, changes only apply on 'Apply Reordering' click
  };

  const handleMoveDown = (currentIndex: number) => {
    if (currentIndex === paragraphOrder.length - 1) return;

    const newOrder = [...paragraphOrder];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    setParagraphOrder(newOrder);
     // Optionally, save the new order or indicate change
     // For now, changes only apply on 'Apply Reordering' click
  };

  const applyReordering = () => {
    const reorderedParagraphs = paragraphOrder.map(originalIndex => paragraphs[originalIndex]);

    // Call the parent handler to update the main paragraphs state with the new order
    onParagraphsChange(reorderedParagraphs);

    // Reset paragraphOrder state to reflect the new logical order (0, 1, 2...)
    // after applying the change to the parent's state.
    const initialOrder = Array.from({ length: reorderedParagraphs.length }, (_, i) => i);
    setParagraphOrder(initialOrder);

    // Also need to reset the active paragraph index and sentences
    // and split sentences for the *new* first paragraph
    setActiveParagraphIndex(0);
    if (reorderedParagraphs.length > 0) {
       splitParagraphIntoSentences(reorderedParagraphs[0], 0); // Split sentences of the new first paragraph
    } else {
       setSentencesInParagraph([]);
       setSelectedSentence("");
       setSelectedSentenceIndex(-1);
       setEditedSentence("");
    }


    toast("Paragraphs reordered", {
      description: "Your paragraphs have been reordered successfully.",
    });
  };

  const getParagraphPreview = (paragraph: string | undefined) => { // Handle potential undefined
    if (!paragraph) return "Empty paragraph";
    const preview = paragraph.substring(0, 100);
    return preview + (paragraph.length > 100 ? "..." : "");
  };

  // CORRECTED: Use fetch to call the serverless function API
  const handleAISuggestions = async () => {
    if (!selectedSentence) {
        toast("No sentence selected", { description: "Please select a sentence to get AI suggestions." });
        return;
    }

    setIsLoadingSuggestions(true);
    setIsAIModalOpen(true); // Open modal immediately while loading
    setAiSuggestions([]); // Clear previous suggestions

    try {
      const response = await fetch('/api/aiSuggestions', { // <-- Target the Vercel API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentence: selectedSentence }), // <-- Send sentence in body
      });

      // Check for HTTP errors (status codes outside 2xx)
      if (!response.ok) {
        let errorData = { message: `API Error: ${response.status}` }; // Default error
        try {
            errorData = await response.json(); // Attempt to parse error response from serverless function
        } catch (jsonError) {
            console.error('Failed to parse error response:', jsonError);
             // If JSON parsing fails, maybe the response was text?
             const textError = await response.text();
             errorData.message = `API Error ${response.status}: ${textError.substring(0, 150)}...`;
        }
        console.error('API Error Response:', response.status, errorData);
        const errorMessage = errorData.message || `API Error: ${response.status}`;
        throw new Error(errorMessage); // Throw error to be caught below and shown in toast
      }

      const data = await response.json(); // Parse the successful JSON response

      // Check if the response contains the expected 'suggestions' array
      if (data && Array.isArray(data.suggestions)) {
         console.log('Suggestions received:', data.suggestions);
         setAiSuggestions(data.suggestions); // Update state with suggestions
         if (data.suggestions.length === 0) {
             toast("No suggestions received", { description: "AI did not return any suggestions for this sentence." });
         }
      } else {
         console.error('Unexpected API response format:', data);
         throw new Error('Unexpected response format from AI API');
      }

    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast.error("Failed to get AI suggestions", {
        description: error instanceof Error ? error.message : "An unknown error occurred. Please try again later.",
      });
      // Close the modal on error
      setIsAIModalOpen(false);
    } finally {
      setIsLoadingSuggestions(false); // Always stop loading
    }
  };


  return (
    // Ensure tabs only render if paragraphs exist, otherwise show a message or nothing
     paragraphs.length === 0 ? (
        <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
                <p className="text-amber-800">
                    Please add some paragraphs in Step 5 to enable refactoring tools.
                </p>
            </CardContent>
        </Card>
     ) : (
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
                   // Use the current active paragraph index in paragraphOrder to determine the default/value
                  value={`paragraph-${activeParagraphIndex}`}
                  className="w-full"
                  onValueChange={(value) => {
                    const index = parseInt(value.split('-')[1]);
                    handleParagraphSelect(index);
                  }}
                >
                  <TabsList className="mb-4 flex flex-wrap h-auto pb-1 gap-1 bg-blue-50">
                    {/* Map over the paragraphOrder state to create tabs */}
                    {paragraphOrder.map((originalIndex, currentIndex) => (
                      <TabsTrigger
                        key={originalIndex} // Use originalIndex for a stable key
                        value={`paragraph-${currentIndex}`} // Use currentIndex for the tab value
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Paragraph {currentIndex + 1} {/* Display based on current order */}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                   {/* Render content only for the currently active tab */}
                    {activeParagraphIndex !== -1 && paragraphOrder[activeParagraphIndex] !== undefined && (
                        <TabsContent
                           // Value must match the trigger value
                           value={`paragraph-${activeParagraphIndex}`}
                           className="space-y-4"
                        >
                            <div className="bg-slate-50 p-4 rounded-md border border-blue-100 mb-4">
                                <h3 className="font-medium text-slate-700 mb-2">Current Paragraph (Original Index: {paragraphOrder[activeParagraphIndex] + 1})</h3> {/* Show original index */}
                                <div>
                                    {sentencesInParagraph.map((sentence, sIndex) => (
                                        <span
                                            key={sIndex} // Sentence index within the current paragraph is fine
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

                                    <div className="flex flex-wrap gap-2"> {/* Use flex-wrap for smaller screens */}
                                        <Button onClick={applyEditedSentence} className="space-x-1 bg-blue-600 hover:bg-blue-700">
                                            <Check className="w-4 h-4" />
                                            <span>Apply Edit</span>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleAISuggestions}
                                            disabled={isLoadingSuggestions || !selectedSentence} // Disable while loading or no sentence
                                            className="space-x-1 border-blue-200 hover:bg-blue-50"
                                        >
                                            {isLoadingSuggestions ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Wand2 className="w-4 h-4" />
                                            )}
                                            <span>{isLoadingSuggestions ? "Getting Suggestions..." : "Get AI Suggestions"}</span>
                                        </Button>
                                        {/* Add Sentence Move and Delete buttons here if they belong to Sentence Editing */}
                                         <Button
                                            variant="outline"
                                            onClick={() => handleSentenceMove('up')}
                                            disabled={selectedSentenceIndex === 0}
                                            className="border-blue-200 hover:bg-blue-50"
                                        >
                                            <ArrowUp className="w-4 h-4" />
                                            <span className="sr-only">Move Sentence Up</span> {/* Accessibility */}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleSentenceMove('down')}
                                            disabled={selectedSentenceIndex === sentencesInParagraph.length - 1}
                                            className="border-blue-200 hover:bg-blue-50"
                                        >
                                            <ArrowDown className="w-4 h-4" />
                                            <span className="sr-only">Move Sentence Down</span> {/* Accessibility */}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleSentenceDelete}
                                            className="space-x-1 border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete Sentence</span>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Show history for the currently active paragraph */}
                            {editHistory.filter(edit => edit.paragraphIndex === paragraphOrder[activeParagraphIndex]).length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-slate-700 mb-2">Edit History for this Paragraph</h3> {/* Removed specific index */}
                                    <div className="bg-white rounded-md border border-blue-100 divide-y divide-blue-50">
                                        {editHistory
                                            .filter(edit => edit.paragraphIndex === paragraphOrder[activeParagraphIndex])
                                            .sort((a, b) => b.timestamp - a.timestamp) // Sort newest first
                                            .map((edit, index) => (
                                                <div key={index} className="p-3">
                                                    <div className="flex items-center text-xs text-slate-500 mb-1">
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                        <span>{new Date(edit.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col space-y-2">
                                                         {/* Only show original if different or deleted */}
                                                         {edit.originalSentence !== edit.newSentence && (
                                                            <div className="text-sm">
                                                                <span className="text-red-500 line-through">Original: "{edit.originalSentence}"</span>
                                                            </div>
                                                         )}
                                                        <div className="text-sm">
                                                            {edit.newSentence ? (
                                                                <span className="text-green-600">Revised: "{edit.newSentence}"</span>
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
                    )}
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
                  {/* Map over paragraphOrder to display paragraphs in their current sequence */}
                  {paragraphOrder.map((originalIndex, currentIndex) => (
                    <div
                      key={originalIndex} // Use originalIndex as the stable key
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
                            <span className="sr-only">Move Paragraph Up</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveDown(currentIndex)}
                            disabled={currentIndex === paragraphOrder.length - 1}
                            className="h-8 w-8"
                          >
                            <ArrowDown className="h-4 w-4" />
                            <span className="sr-only">Move Paragraph Down</span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 p-4">
                        <div className="flex items-center gap-2 mb-2">
                           {/* Display original paragraph number based on the index in the original paragraphs array */}
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                            Original Paragraph {originalIndex + 1}
                          </span>
                          <span className="text-sm text-slate-500">
                            (Current position {currentIndex + 1}) {/* Display current position based on loop index */}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">
                          {getParagraphPreview(paragraphs[originalIndex])} {/* Get content from the original paragraphs array */}
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
            onSelectSuggestion={(suggestion) => {
                setEditedSentence(suggestion); // Set the edited sentence field to the suggestion
                setIsAIModalOpen(false); // Close modal after selecting
            }}
            suggestions={aiSuggestions}
            isLoading={isLoadingSuggestions}
          />
        </Tabs>
     )
  );
}