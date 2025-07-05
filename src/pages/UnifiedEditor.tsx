
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActiveEssay, getEssayData, saveEssayData, createNewEssay } from "@/utils/localStorage";
import { ArrowLeft, Plus, Eye, BarChart3 } from "lucide-react";
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
  const [topicInput, setTopicInput] = useState("");
  const [sentenceInputs, setSentenceInputs] = useState<{[key: number]: string}>({});
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<SelectedText>({ text: '', start: 0, end: 0 });
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiCoachPosition, setAiCoachPosition] = useState({ x: 0, y: 0 });
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
    if (!topicInput.trim() || !essayData) return;
    
    const updatedData = {
      ...essayData,
      topics: [...essayData.topics, topicInput.trim()]
    };
    setEssayData(updatedData);
    autoSave(updatedData);
    setTopicInput("");
    
    // Transition to outline state if this is the first topic
    if (editorState === 'initial') {
      setEditorState('outline');
    }
  };

  const addFirstSentence = (topicIndex: number) => {
    const currentInput = sentenceInputs[topicIndex] || "";
    if (!currentInput.trim() || !essayData) return;
    
    const updatedSentences = { ...essayData.sentences };
    if (!Array.isArray(updatedSentences[topicIndex])) {
      updatedSentences[topicIndex] = [];
    }
    updatedSentences[topicIndex].push(currentInput.trim());
    
    const updatedData = { ...essayData, sentences: updatedSentences };
    setEssayData(updatedData);
    autoSave(updatedData);
    
    // Clear the specific input
    setSentenceInputs(prev => ({
      ...prev,
      [topicIndex]: ""
    }));
  };

  const updateSentenceInput = (topicIndex: number, value: string) => {
    setSentenceInputs(prev => ({
      ...prev,
      [topicIndex]: value
    }));
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

  const handleTextSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!textareaRef.current) return;
    
    setTimeout(() => {
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value.substring(start, end);
      
      if (text.trim().length > 10 && text.trim().length < 500) {
        // Get the position for the AI coach
        const rect = textarea.getBoundingClientRect();
        setAiCoachPosition({
          x: rect.right - 320, // Position from right side
          y: rect.top + 60
        });
        
        setSelectedText({ text: text.trim(), start, end });
        setShowAICoach(true);
      } else {
        setShowAICoach(false);
      }
    }, 100);
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Mobile responsive */}
      <div className="bg-background border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="rounded-full hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Input
            value={essayData.essay.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-lg sm:text-xl font-medium bg-transparent border-none px-0 focus:border-primary min-w-0"
            placeholder="Untitled Essay"
          />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            onClick={() => setIsPreviewOpen(true)}
            variant="outline"
            size="sm"
            className="hidden sm:flex"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={() => setIsPreviewOpen(true)}
            variant="outline"
            size="sm"
            className="sm:hidden"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => navigate("/analysis")}
            size="sm"
            className="bg-primary hover:bg-primary/90 hidden sm:flex"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze
          </Button>
          
          <Button
            onClick={() => navigate("/analysis")}
            size="sm"
            className="bg-primary hover:bg-primary/90 sm:hidden"
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Hidden on mobile in initial state, collapsible on tablet */}
        {editorState !== 'initial' && (
          <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col lg:min-h-0">
            <div className="p-4 sm:p-6 border-b border-border">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Essay Outline</h3>
              
              <div className="space-y-3 max-h-60 lg:max-h-none overflow-y-auto">
                {essayData.topics.map((topic, topicIndex) => (
                  <div key={topicIndex} className="space-y-2">
                    {/* Topic header with better hierarchy */}
                    <div className="font-semibold text-lg p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                      {topic}
                    </div>
                    
                    {/* First sentences for this topic */}
                    {Array.isArray(essayData.sentences[topicIndex]) && essayData.sentences[topicIndex].length > 0 && (
                      <div className="ml-4 space-y-2">
                        {essayData.sentences[topicIndex].map((sentence: string, sentenceIndex: number) => (
                          <div
                            key={sentenceIndex}
                            className={`p-3 text-sm rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedTopicIndex === topicIndex && selectedSentenceIndex === sentenceIndex
                                ? 'bg-primary/10 border-2 border-primary/30 shadow-md'
                                : 'bg-background text-muted-foreground border border-border/50 hover:bg-muted/30'
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
                        value={sentenceInputs[topicIndex] || ""}
                        onChange={(e) => updateSentenceInput(topicIndex, e.target.value)}
                        placeholder="Add first sentence..."
                        className="text-sm bg-muted/20 border-muted focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addFirstSentence(topicIndex);
                          }
                        }}
                      />
                      <Button
                        onClick={() => addFirstSentence(topicIndex)}
                        disabled={!sentenceInputs[topicIndex]?.trim()}
                        size="sm"
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sentence
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="space-y-2">
                <Input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Add new topic question..."
                  className="bg-muted/20 border-muted focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addTopicQuestion();
                    }
                  }}
                />
                <Button
                  onClick={addTopicQuestion}
                  disabled={!topicInput.trim()}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Topic Question
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
              {/* Initial State - Blank Canvas */}
              {editorState === 'initial' && (
                <div className="text-center space-y-6 sm:space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">Let's start with your first topic question.</h1>
                    <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
                      What's the main question you want to explore in your essay?
                    </p>
                  </div>
                  
                  <div className="max-w-lg mx-auto space-y-4">
                    <Input
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g., Why is critical thinking important?"
                      className="text-base sm:text-lg h-14 sm:h-16 border-2 focus:border-primary text-center"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTopicQuestion();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      onClick={addTopicQuestion}
                      disabled={!topicInput.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 sm:h-14 text-lg font-semibold w-full sm:w-auto"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Topic
                    </Button>
                  </div>
                </div>
              )}

              {/* Outline State */}
              {editorState === 'outline' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Great! Now let's build your outline.</h1>
                    <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
                      Add first sentences for each topic in the sidebar. Click on any sentence to start writing that paragraph.
                    </p>
                  </div>
                  
                  <div className="bg-primary/5 border-l-4 border-primary p-6 sm:p-8 rounded-r-lg">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
                      📝 Current Task: Add First Sentences
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                      Use the sidebar to add first sentences for each topic. These will become the foundation of your paragraphs.
                    </p>
                  </div>
                </div>
              )}

              {/* Paragraph State */}
              {editorState === 'paragraph' && selectedTopicIndex !== null && selectedSentenceIndex !== null && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Write Your Paragraph</h1>
                    <div className="p-6 sm:p-8 bg-primary/5 rounded-lg border-l-4 border-primary">
                      <p className="font-lora text-2xl sm:text-3xl leading-relaxed text-foreground font-medium">
                        {getCurrentFirstSentence()}
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl text-muted-foreground">
                      Expand on this sentence. Develop your argument with evidence and analysis.
                    </p>
                  </div>

                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={getCurrentParagraphContent()}
                      onChange={(e) => updateParagraph(selectedTopicIndex, selectedSentenceIndex, e.target.value)}
                      onMouseUp={handleTextSelection}
                      onKeyUp={handleTextSelection}
                      placeholder="Start writing your paragraph here. Develop your argument with evidence, examples, and analysis..."
                      className="min-h-[400px] sm:min-h-[500px] text-lg sm:text-xl font-lora leading-relaxed resize-none border-2 focus:border-primary p-6"
                    />
                    
                    {/* AI Coach positioned outside the textarea */}
                    {showAICoach && selectedText.text && (
                      <div 
                        className="fixed z-50"
                        style={{
                          top: `${aiCoachPosition.y}px`,
                          right: '20px'
                        }}
                      >
                        <AICoach
                          selectedText={selectedText.text}
                          onClose={() => setShowAICoach(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
