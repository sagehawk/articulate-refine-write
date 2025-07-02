
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { ArrowLeft, Plus, Edit, Eye, Wand2, BarChart3, Save, Check } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";

const Editor = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState(null);
  const [activeSection, setActiveSection] = useState({ type: 'topic', topicIndex: 0, sentenceIndex: null });
  const [currentInput, setCurrentInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const saveTimeoutRef = useRef(null);

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

  const autoSave = (updatedData) => {
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

  const updateTitle = (newTitle) => {
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

  const addSentence = (topicIndex) => {
    if (!currentInput.trim() || !essayData) return;
    
    const updatedSentences = { ...essayData.sentences };
    if (!updatedSentences[topicIndex]) {
      updatedSentences[topicIndex] = [];
    }
    updatedSentences[topicIndex].push(currentInput.trim());
    
    const updatedData = { ...essayData, sentences: updatedSentences };
    setEssayData(updatedData);
    autoSave(updatedData);
    setCurrentInput("");
  };

  const addParagraph = (topicIndex, sentenceIndex) => {
    if (!currentInput.trim() || !essayData) return;
    
    const updatedParagraphs = { ...essayData.paragraphs };
    if (!updatedParagraphs[topicIndex]) {
      updatedParagraphs[topicIndex] = [];
    }
    updatedParagraphs[topicIndex][sentenceIndex] = currentInput.trim();
    
    const updatedData = { ...essayData, paragraphs: updatedParagraphs };
    setEssayData(updatedData);
    autoSave(updatedData);
    setCurrentInput("");
  };

  const handleFinalize = () => {
    navigate("/analysis");
  };

  const getProgress = () => {
    if (!essayData) return 0;
    
    const topicCount = essayData.topics.length;
    const sentenceCount = Object.values(essayData.sentences || {}).reduce((acc, sentences) => acc + sentences.length, 0);
    const paragraphCount = Object.values(essayData.paragraphs || {}).reduce((acc, paragraphs) => acc + paragraphs.length, 0);
    
    if (topicCount === 0) return 0;
    if (sentenceCount === 0) return 25;
    if (paragraphCount === 0) return 50;
    return 75;
  };

  if (!essayData) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Outline */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/library")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
          
          <div className="space-y-3">
            <Input
              value={essayData.essay.title}
              onChange={(e) => updateTitle(e.target.value)}
              className="input-field font-semibold text-lg border-none bg-transparent p-0 focus:ring-0"
              placeholder="Untitled Essay"
            />
            <Progress value={getProgress()} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              {saveStatus && (
                <span className={`text-xs ${saveStatus === 'Saved' ? 'text-primary' : saveStatus === 'Saving...' ? 'text-muted-foreground' : 'text-destructive'}`}>
                  {saveStatus === 'Saved' && <Check className="w-3 h-3 inline mr-1" />}
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
                {essayData.sentences[index] && (
                  <div className="ml-4 space-y-1">
                    {essayData.sentences[index].map((sentence, sentenceIndex) => (
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
              className="w-full justify-start text-muted-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Topic Question
            </Button>
          </div>
        </div>
        
        <div className="p-6 border-t border-border space-y-2">
          <Button
            onClick={() => setShowPreview(true)}
            className="btn-secondary w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Essay
          </Button>
          <Button
            onClick={handleFinalize}
            className="btn-primary w-full"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Finalize & Analyze
          </Button>
        </div>
      </div>

      {/* Right Panel - Writing Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="container-essay py-12">
            {/* Dynamic Content Based on Active Section */}
            {activeSection.type === 'add-topic' && (
              <div className="space-y-6 fade-in">
                <div className="text-center space-y-4">
                  <h1 className="text-h1">What's your topic question?</h1>
                  <p className="text-muted-foreground">
                    Break down your essay into key questions you want to explore
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Enter a topic question..."
                    className="input-field min-h-[120px] text-lg resize-none"
                    autoFocus
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={addTopic}
                      disabled={!currentInput.trim()}
                      className="btn-primary"
                    >
                      Add Topic
                    </Button>
                    {essayData.topics.length > 0 && (
                      <Button
                        onClick={() => setActiveSection({ type: 'topic', topicIndex: 0, sentenceIndex: null })}
                        className="btn-secondary"
                      >
                        Continue to Sentences
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection.type === 'topic' && (
              <div className="space-y-6 fade-in">
                <div className="text-center space-y-4">
                  <h1 className="text-h1">First Sentences</h1>
                  <div className="p-6 bg-card rounded-lg border">
                    <h2 className="text-h2 font-lora">
                      {essayData.topics[activeSection.topicIndex]}
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    Write the first sentence of each paragraph for this topic
                  </p>
                </div>

                <div className="space-y-4">
                  {essayData.sentences[activeSection.topicIndex]?.map((sentence, index) => (
                    <div
                      key={index}
                      className="p-4 bg-card rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setActiveSection({ type: 'sentence', topicIndex: activeSection.topicIndex, sentenceIndex: index })}
                    >
                      <p className="font-lora leading-relaxed">{sentence}</p>
                    </div>
                  ))}

                  <div className="space-y-4">
                    <Textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Write the first sentence of a paragraph..."
                      className="input-field min-h-[100px] text-lg resize-none font-lora"
                      autoFocus
                    />
                    
                    <Button
                      onClick={() => addSentence(activeSection.topicIndex)}
                      disabled={!currentInput.trim()}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sentence
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeSection.type === 'sentence' && (
              <div className="space-y-6 fade-in">
                <div className="text-center space-y-4">
                  <h1 className="text-h1">Write Your Paragraph</h1>
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="font-lora text-lg leading-relaxed">
                      {essayData.sentences[activeSection.topicIndex][activeSection.sentenceIndex]}
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    Expand this first sentence into a full paragraph
                  </p>
                </div>

                <div className="space-y-4">
                  {essayData.paragraphs[activeSection.topicIndex]?.[activeSection.sentenceIndex] ? (
                    <div className="p-6 bg-card rounded-lg border">
                      <p className="font-lora text-lg leading-relaxed whitespace-pre-wrap">
                        {essayData.paragraphs[activeSection.topicIndex][activeSection.sentenceIndex]}
                      </p>
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="ghost"
                        className="mt-4"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Paragraph
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Textarea
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Write your paragraph here..."
                        className="input-field min-h-[200px] text-lg resize-none font-lora leading-relaxed"
                        autoFocus
                      />
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => addParagraph(activeSection.topicIndex, activeSection.sentenceIndex)}
                          disabled={!currentInput.trim()}
                          className="btn-primary"
                        >
                          Save Paragraph
                        </Button>
                        <Button
                          className="btn-secondary"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          AI Coach
                        </Button>
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
