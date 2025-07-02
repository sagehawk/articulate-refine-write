
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { ArrowLeft, Plus, Edit, Eye, Wand2, BarChart3, Save, Check, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";
import { EssayData } from "@/types/essay";

const Editor = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [activeSection, setActiveSection] = useState({ type: 'topic', topicIndex: 0, sentenceIndex: null as number | null });
  const [currentInput, setCurrentInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (!activeEssayId) {
      navigate("/");
      return;
    }

    const data = getEssayData(activeEssayId);
    if (!data) {
      navigate("/");
      return;
    }

    setEssayData(data);
  }, [navigate]);

  const autoSave = (updatedData: EssayData) => {
    setSaveStatus("Saving...");
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      try {
        saveEssayData(updatedData);
        setSaveStatus("Saved");
        setTimeout(() => setSaveStatus(""), 2000);
      } catch (error) {
        setSaveStatus("Error saving");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    }, 1000);
  };

  const updateTitle = (newTitle: string) => {
    if (!essayData) return;
    
    const updatedData = {
      ...essayData,
      essay: { ...essayData.essay, title: newTitle || "Untitled Essay" }
    };
    setEssayData(updatedData);
    autoSave(updatedData);
  };

  const addTopic = () => {
    if (!currentInput.trim() || !essayData) return;
    
    const updatedData = {
      ...essayData,
      topics: [...essayData.topics, currentInput.trim()]
    };
    setEssayData(updatedData);
    autoSave(updatedData);
    setCurrentInput("");
  };

  const addSentence = (topicIndex: number) => {
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

  const addParagraph = (topicIndex: number, sentenceIndex: number) => {
    if (!currentInput.trim() || !essayData) return;
    
    const updatedParagraphs = { ...essayData.paragraphs };
    if (!Array.isArray(updatedParagraphs[topicIndex])) {
      updatedParagraphs[topicIndex] = [];
    }
    updatedParagraphs[topicIndex][sentenceIndex] = currentInput.trim();
    
    const updatedData = { ...essayData, paragraphs: updatedParagraphs };
    setEssayData(updatedData);
    autoSave(updatedData);
    setCurrentInput("");
    setIsEditing(false);
  };

  const handleFinalize = () => {
    navigate("/analysis");
  };

  const getProgress = () => {
    if (!essayData) return 0;
    
    const topicCount = essayData.topics.length;
    const sentenceCount = Object.values(essayData.sentences || {}).reduce((acc, sentences) => {
      return acc + (Array.isArray(sentences) ? sentences.length : 0);
    }, 0);
    const paragraphCount = Object.values(essayData.paragraphs || {}).reduce((acc, paragraphs) => {
      return acc + (Array.isArray(paragraphs) ? paragraphs.length : 0);
    }, 0);
    
    if (topicCount === 0) return 0;
    if (sentenceCount === 0) return 25;
    if (paragraphCount === 0) return 50;
    return 75;
  };

  if (!essayData) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-card border border-border rounded-lg p-2 hover:bg-muted"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Left Panel - Outline */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-40 w-80 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/library")}
              className="rounded-full hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
          
          <div className="space-y-3">
            {editingTitle ? (
              <Input
                value={essayData.essay.title}
                onChange={(e) => updateTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                className="font-semibold text-lg bg-transparent border-primary"
                autoFocus
              />
            ) : (
              <h1 
                onClick={() => setEditingTitle(true)}
                className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors p-2 -m-2 rounded"
              >
                {essayData.essay.title}
              </h1>
            )}
            <Progress value={getProgress()} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              {saveStatus && (
                <span className={`text-xs flex items-center gap-1 ${saveStatus === 'Saved' ? 'text-primary' : saveStatus === 'Saving...' ? 'text-muted-foreground' : 'text-destructive'}`}>
                  {saveStatus === 'Saved' && <Check className="w-3 h-3" />}
                  {saveStatus}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Topics */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Topics</h3>
            {essayData.topics.map((topic, index) => (
              <div key={index} className="space-y-1">
                <div
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeSection.type === 'topic' && activeSection.topicIndex === index
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setActiveSection({ type: 'topic', topicIndex: index, sentenceIndex: null })}
                >
                  <div className="font-medium text-sm line-clamp-2">{topic}</div>
                </div>
                
                {/* Sentences for this topic */}
                {Array.isArray(essayData.sentences[index]) && essayData.sentences[index].length > 0 && (
                  <div className="ml-4 space-y-1">
                    {essayData.sentences[index].map((sentence: string, sentenceIndex: number) => (
                      <div
                        key={sentenceIndex}
                        className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                          activeSection.type === 'sentence' && 
                          activeSection.topicIndex === index && 
                          activeSection.sentenceIndex === sentenceIndex
                            ? 'bg-accent/10 border border-accent/20'
                            : 'bg-background hover:bg-muted/30'
                        }`}
                        onClick={() => setActiveSection({ type: 'sentence', topicIndex: index, sentenceIndex })}
                      >
                        <div className="line-clamp-2">{sentence}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <Button
              onClick={() => setActiveSection({ type: 'add-topic', topicIndex: essayData.topics.length, sentenceIndex: null })}
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Topic Question
            </Button>
          </div>
        </div>
        
        <div className="p-6 border-t border-border space-y-2">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Essay
          </Button>
          <Button
            onClick={handleFinalize}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Finalize & Analyze
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Right Panel - Writing Canvas */}
      <div className="flex-1 flex flex-col md:ml-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Dynamic Content Based on Active Section */}
            {activeSection.type === 'add-topic' && (
              <div className="space-y-8 fade-in">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold text-foreground mb-2">What's your topic question?</h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Break down your essay into key questions you want to explore. Each question will become a major section of your argument.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Enter a topic question that you want to explore in your essay..."
                    className="min-h-[120px] text-lg resize-none border-border focus:border-primary"
                    autoFocus
                  />
                  
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={addTopic}
                      disabled={!currentInput.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Topic
                    </Button>
                    {essayData.topics.length > 0 && (
                      <Button
                        onClick={() => setActiveSection({ type: 'topic', topicIndex: 0, sentenceIndex: null })}
                        variant="outline"
                        className="px-8"
                      >
                        Continue to Sentences
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection.type === 'topic' && (
              <div className="space-y-8 fade-in">
                <div className="text-center space-y-6">
                  <h1 className="text-4xl font-bold text-foreground mb-2">Write First Sentences</h1>
                  <div className="p-8 bg-card rounded-lg border border-border">
                    <h2 className="text-2xl font-lora font-medium text-foreground leading-relaxed">
                      {essayData.topics[activeSection.topicIndex]}
                    </h2>
                  </div>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Write the first sentence of each paragraph for this topic. These will become the foundation of your argument.
                  </p>
                </div>

                <div className="space-y-6">
                  {Array.isArray(essayData.sentences[activeSection.topicIndex]) && 
                   essayData.sentences[activeSection.topicIndex].map((sentence: string, index: number) => (
                    <div
                      key={index}
                      className="p-6 bg-card rounded-lg border border-border cursor-pointer hover:border-primary/30 transition-all group"
                      onClick={() => setActiveSection({ type: 'sentence', topicIndex: activeSection.topicIndex, sentenceIndex: index })}
                    >
                      <p className="font-lora text-lg leading-relaxed text-foreground group-hover:text-primary transition-colors">
                        {sentence}
                      </p>
                    </div>
                  ))}

                  <div className="space-y-6">
                    <Textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Write the first sentence of a paragraph that supports your topic..."
                      className="min-h-[100px] text-lg resize-none font-lora border-border focus:border-primary"
                      autoFocus
                    />
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={() => addSentence(activeSection.topicIndex)}
                        disabled={!currentInput.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Sentence
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection.type === 'sentence' && activeSection.sentenceIndex !== null && (
              <div className="space-y-8 fade-in">
                <div className="text-center space-y-6">
                  <h1 className="text-4xl font-bold text-foreground mb-2">Write Your Paragraph</h1>
                  <div className="p-6 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="font-lora text-xl leading-relaxed text-foreground">
                      {Array.isArray(essayData.sentences[activeSection.topicIndex]) && 
                       essayData.sentences[activeSection.topicIndex][activeSection.sentenceIndex]}
                    </p>
                  </div>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Expand this first sentence into a full paragraph. Develop your argument with evidence and analysis.
                  </p>
                </div>

                <div className="space-y-6">
                  {Array.isArray(essayData.paragraphs[activeSection.topicIndex]) && 
                   essayData.paragraphs[activeSection.topicIndex][activeSection.sentenceIndex] && !isEditing ? (
                    <div className="p-8 bg-card rounded-lg border border-border">
                      <p className="font-lora text-lg leading-relaxed whitespace-pre-wrap text-foreground mb-6">
                        {essayData.paragraphs[activeSection.topicIndex][activeSection.sentenceIndex]}
                      </p>
                      <Button
                        onClick={() => {
                          setIsEditing(true);
                          setCurrentInput(essayData.paragraphs[activeSection.topicIndex][activeSection.sentenceIndex]);
                        }}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Paragraph
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Textarea
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Write your paragraph here. Develop your argument with evidence, examples, and analysis..."
                        className="min-h-[200px] text-lg resize-none font-lora leading-relaxed border-border focus:border-primary"
                        autoFocus
                      />
                      
                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={() => addParagraph(activeSection.topicIndex, activeSection.sentenceIndex!)}
                          disabled={!currentInput.trim()}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Paragraph
                        </Button>
                        <Button
                          variant="outline"
                          className="px-8"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          AI Coach
                        </Button>
                        {isEditing && (
                          <Button
                            onClick={() => {
                              setIsEditing(false);
                              setCurrentInput("");
                            }}
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;

