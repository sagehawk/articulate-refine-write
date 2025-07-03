
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActiveEssay, getEssayData, saveEssayData, createNewEssay } from "@/utils/localStorage";
import { ArrowLeft, Plus, Save, Eye, BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EssayData } from "@/types/essay";
import { PreviewModal } from "@/components/PreviewModal";
import { AICoach } from "@/components/AICoach";

type EditorState = 'initial' | 'outline' | 'paragraph';

interface SelectedText {
  text: string;
  start: number;
  end: number;
}

const UnifiedEditor = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [editorState, setEditorState] = useState<EditorState>('initial');
  const [currentInput, setCurrentInput] = useState("");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<SelectedText>({ text: '', start: 0, end: 0 });
  const [showAICoach, setShowAICoach] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        // Determine the appropriate initial state based on existing data
        if (data.topics.length > 0) {
          setEditorState('outline');
        }
      }
    } else {
      // Create a new essay if none exists
      const newEssay = createNewEssay("Untitled Essay");
      setEssayData(newEssay);
    }
  }, []);

  const autoSave = (updatedData: EssayData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveEssayData(updatedData);
    }, 1000);
  };

  const updateTitle = (newTitle: string) => {
    if (!essayData || !newTitle.trim()) return;
    
    const updatedData = {
      ...essayData,
      essay: { ...essayData.essay, title: newTitle }
    };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

  const addTopicQuestion = () => {
    if (!currentInput.trim() || !essayData) return;
    
    const updatedData = {
      ...essayData,
      topics: [...essayData.topics, currentInput.trim()]
    };
    setEssayData(updatedData);
    autoSave(updatedData);
    setCurrentInput("");
    
    // Transition to outline state if this is the first topic
    if (editorState === 'initial') {
      setEditorState('outline');
    }
  };

  const addFirstSentence = (topicIndex: number) => {
    if (!currentInput.trim() || !essayData) return;
    
    const updatedSentences = { ...essayData.sentences };
    if (!Array.isArray(updatedSentences[topicIndex])) {
      updatedSentences[topicIndex] = [];
    }
    updatedSentences[topicIndex].push(currentInput.trim());
    
    const updatedData = { ...essayData, sentences: updatedSentences };
    setEssayData(updatedData);
    autoSave(updatedData);
    setCurrentInput("");
  };

  const updateParagraph = (topicIndex: number, sentenceIndex: number, content: string) => {
    if (!essayData) return;
    
    const updatedParagraphs = { ...essayData.paragraphs };
    if (!Array.isArray(updatedParagraphs[topicIndex])) {
      updatedParagraphs[topicIndex] = [];
    }
    updatedParagraphs[topicIndex][sentenceIndex] = content;
    
    const updatedData = { ...essayData, paragraphs: updatedParagraphs };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

  const handleSentenceClick = (topicIndex: number, sentenceIndex: number) => {
    setSelectedTopicIndex(topicIndex);
    setSelectedSentenceIndex(sentenceIndex);
    setEditorState('paragraph');
  };

  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.substring(start, end);
    
    if (text.trim().length > 0) {
      setSelectedText({ text: text.trim(), start, end });
      setShowAICoach(true);
    } else {
      setShowAICoach(false);
    }
  };

  const handleAISuggestion = (suggestion: string) => {
    if (!textareaRef.current || !essayData || selectedTopicIndex === null || selectedSentenceIndex === null) return;
    
    const textarea = textareaRef.current;
    const currentValue = textarea.value;
    const newValue = currentValue.substring(0, selectedText.start) + suggestion + currentValue.substring(selectedText.end);
    
    textarea.value = newValue;
    updateParagraph(selectedTopicIndex, selectedSentenceIndex, newValue);
    setShowAICoach(false);
  };

  const getCurrentParagraphContent = () => {
    if (!essayData || selectedTopicIndex === null || selectedSentenceIndex === null) return "";
    
    const paragraphs = essayData.paragraphs[selectedTopicIndex];
    if (Array.isArray(paragraphs) && paragraphs[selectedSentenceIndex]) {
      return paragraphs[selectedSentenceIndex];
    }
    return "";
  };

  const getCurrentFirstSentence = () => {
    if (!essayData || selectedTopicIndex === null || selectedSentenceIndex === null) return "";
    
    const sentences = essayData.sentences[selectedTopicIndex];
    if (Array.isArray(sentences) && sentences[selectedSentenceIndex]) {
      return sentences[selectedSentenceIndex];
    }
    return "";
  };

  if (!essayData) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Input
            value={essayData.essay.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-xl font-medium bg-transparent border-none px-0 focus:border-primary"
            placeholder="Untitled Essay"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsPreviewOpen(true)}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={() => navigate("/analysis")}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze
          </Button>
          
          <ThemeToggle />
        </div>
      </div>

      {/* Sidebar - only visible after initial state */}
      {editorState !== 'initial' && (
        <div className="w-80 bg-card border-r border-border flex flex-col mt-20 animate-in slide-in-from-left duration-300">
          <div className="p-6 border-b border-border">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Essay Outline</h3>
            
            <div className="space-y-3">
              {essayData.topics.map((topic, topicIndex) => (
                <div key={topicIndex} className="space-y-2">
                  <div className="font-medium text-sm p-3 bg-muted/50 rounded-lg">
                    {topic}
                  </div>
                  
                  {/* First sentences for this topic */}
                  {Array.isArray(essayData.sentences[topicIndex]) && essayData.sentences[topicIndex].length > 0 && (
                    <div className="ml-4 space-y-1">
                      {essayData.sentences[topicIndex].map((sentence: string, sentenceIndex: number) => (
                        <div
                          key={sentenceIndex}
                          className={`p-2 text-sm rounded cursor-pointer transition-colors hover:bg-muted/30 ${
                            selectedTopicIndex === topicIndex && selectedSentenceIndex === sentenceIndex
                              ? 'bg-primary/10 border border-primary/20'
                              : 'bg-background'
                          }`}
                          onClick={() => handleSentenceClick(topicIndex, sentenceIndex)}
                        >
                          {sentence}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add first sentence input */}
                  <div className="ml-4 space-y-2">
                    <Input
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Add first sentence..."
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addFirstSentence(topicIndex);
                        }
                      }}
                    />
                    <Button
                      onClick={() => addFirstSentence(topicIndex)}
                      disabled={!currentInput.trim()}
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sentence
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Add new topic question..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTopicQuestion();
                  }
                }}
              />
              <Button
                onClick={addTopicQuestion}
                disabled={!currentInput.trim()}
                variant="ghost"
                className="w-full justify-start text-muted-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Topic Question
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col mt-20">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Initial State - Blank Canvas */}
            {editorState === 'initial' && (
              <div className="text-center space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-foreground">Let's start with your first topic question.</h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    What's the main question you want to explore in your essay?
                  </p>
                </div>
                
                <div className="max-w-lg mx-auto space-y-4">
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="e.g., Why is critical thinking important?"
                    className="text-lg h-12"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addTopicQuestion();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={addTopicQuestion}
                    disabled={!currentInput.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Topic
                  </Button>
                </div>
              </div>
            )}

            {/* Outline State */}
            {editorState === 'outline' && (
              <div className="text-center space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-foreground">Great! Now let's build your outline.</h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Add first sentences for each topic in the sidebar. Click on any sentence to start writing that paragraph.
                  </p>
                </div>
              </div>
            )}

            {/* Paragraph State */}
            {editorState === 'paragraph' && selectedTopicIndex !== null && selectedSentenceIndex !== null && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-foreground">Write Your Paragraph</h1>
                  <div className="p-6 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="font-lora text-xl leading-relaxed text-foreground">
                      {getCurrentFirstSentence()}
                    </p>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    Expand on this sentence. Develop your argument with evidence and analysis.
                  </p>
                </div>

                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={getCurrentParagraphContent()}
                    onChange={(e) => updateParagraph(selectedTopicIndex, selectedSentenceIndex, e.target.value)}
                    onSelect={handleTextSelection}
                    placeholder="Start writing your paragraph here. Develop your argument with evidence, examples, and analysis..."
                    className="min-h-[300px] text-lg font-lora leading-relaxed resize-none border-border focus:border-primary"
                  />
                  
                  {showAICoach && (
                    <div className="absolute top-4 right-4">
                      <AICoach
                        selectedText={selectedText.text}
                        onSuggestion={handleAISuggestion}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        essayData={essayData}
      />
    </div>
  );
};

export default UnifiedEditor;
