
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Edit } from "lucide-react";
import { EssayData } from "@/types/essay";

interface EditorSidebarProps {
  essayData: EssayData;
  selectedTopicIndex: number | null;
  selectedSentenceIndex: number | null;
  onAddTopic: (topic: string) => void;
  onAddSentence: (topicIndex: number, sentence: string) => void;
  onSentenceClick: (topicIndex: number, sentenceIndex: number) => void;
  onEditTopic?: (topicIndex: number, newTopic: string) => void;
  onEditSentence?: (topicIndex: number, sentenceIndex: number, newSentence: string) => void;
}

export const EditorSidebar = ({
  essayData,
  selectedTopicIndex,
  selectedSentenceIndex,
  onAddTopic,
  onAddSentence,
  onSentenceClick,
  onEditTopic,
  onEditSentence
}: EditorSidebarProps) => {
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [showSentenceInput, setShowSentenceInput] = useState<{[key: number]: boolean}>({});
  const [sentenceInputs, setSentenceInputs] = useState<{[key: number]: string}>({});
  const [editingTopic, setEditingTopic] = useState<number | null>(null);
  const [editingTopicValue, setEditingTopicValue] = useState("");
  const [editingSentence, setEditingSentence] = useState<{topicIndex: number, sentenceIndex: number} | null>(null);
  const [editingSentenceValue, setEditingSentenceValue] = useState("");

  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    onAddTopic(topicInput.trim());
    setTopicInput("");
    setShowTopicInput(false);
  };

  const handleAddSentence = (topicIndex: number) => {
    const currentInput = sentenceInputs[topicIndex] || "";
    if (!currentInput.trim()) return;
    onAddSentence(topicIndex, currentInput.trim());
    setSentenceInputs(prev => ({ ...prev, [topicIndex]: "" }));
    setShowSentenceInput(prev => ({ ...prev, [topicIndex]: false }));
  };

  const handleEditTopic = (topicIndex: number) => {
    setEditingTopic(topicIndex);
    setEditingTopicValue(essayData.topics[topicIndex]);
  };

  const handleSaveTopicEdit = () => {
    if (editingTopic !== null && editingTopicValue.trim() && onEditTopic) {
      onEditTopic(editingTopic, editingTopicValue.trim());
    }
    setEditingTopic(null);
    setEditingTopicValue("");
  };

  const handleEditSentence = (topicIndex: number, sentenceIndex: number) => {
    const sentences = essayData.sentences[topicIndex];
    if (Array.isArray(sentences) && sentences[sentenceIndex]) {
      setEditingSentence({ topicIndex, sentenceIndex });
      setEditingSentenceValue(sentences[sentenceIndex]);
    }
  };

  const handleSaveSentenceEdit = () => {
    if (editingSentence && editingSentenceValue.trim() && onEditSentence) {
      onEditSentence(editingSentence.topicIndex, editingSentence.sentenceIndex, editingSentenceValue.trim());
    }
    setEditingSentence(null);
    setEditingSentenceValue("");
  };

  const updateSentenceInput = (topicIndex: number, value: string) => {
    setSentenceInputs(prev => ({ ...prev, [topicIndex]: value }));
  };

  const toggleSentenceInput = (topicIndex: number) => {
    setShowSentenceInput(prev => ({ ...prev, [topicIndex]: !prev[topicIndex] }));
    if (!showSentenceInput[topicIndex]) {
      // Focus the input after it appears
      setTimeout(() => {
        const input = document.getElementById(`sentence-input-${topicIndex}`);
        if (input) input.focus();
      }, 100);
    }
  };

  const toggleTopicInput = () => {
    setShowTopicInput(!showTopicInput);
    if (!showTopicInput) {
      setTimeout(() => {
        const input = document.getElementById('topic-input');
        if (input) input.focus();
      }, 100);
    }
  };

  return (
    <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col lg:min-h-0">
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Essay Outline</h3>
        
        <div className="space-y-4 max-h-60 lg:max-h-none overflow-y-auto">
          {essayData.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="space-y-3">
              {editingTopic === topicIndex ? (
                <div className="space-y-2">
                  <Input
                    value={editingTopicValue}
                    onChange={(e) => setEditingTopicValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveTopicEdit();
                      } else if (e.key === 'Escape') {
                        setEditingTopic(null);
                      }
                    }}
                    className="text-sm bg-muted/20 border-muted focus:border-primary"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={handleSaveTopicEdit}
                      size="sm"
                      variant="default"
                      className="h-7 px-3 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setEditingTopic(null)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-3 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="font-semibold text-base p-4 bg-primary/10 rounded-lg border-l-4 border-primary cursor-pointer hover:bg-primary/15 transition-colors group flex items-center justify-between"
                  onClick={() => handleEditTopic(topicIndex)}
                >
                  <span className="flex-1">{topic}</span>
                  <Edit className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
              )}
              
              {Array.isArray(essayData.sentences[topicIndex]) && essayData.sentences[topicIndex].length > 0 && (
                <div className="ml-4 space-y-2">
                  {essayData.sentences[topicIndex].map((sentence: string, sentenceIndex: number) => (
                    <div key={sentenceIndex}>
                      {editingSentence?.topicIndex === topicIndex && editingSentence?.sentenceIndex === sentenceIndex ? (
                        <div className="space-y-2">
                          <Input
                            value={editingSentenceValue}
                            onChange={(e) => setEditingSentenceValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveSentenceEdit();
                              } else if (e.key === 'Escape') {
                                setEditingSentence(null);
                              }
                            }}
                            className="text-sm bg-muted/20 border-muted focus:border-primary"
                            autoFocus
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={handleSaveSentenceEdit}
                              size="sm"
                              variant="default"
                              className="h-6 px-2 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingSentence(null)}
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`p-3 text-sm rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md group flex items-center justify-between ${
                            selectedTopicIndex === topicIndex && selectedSentenceIndex === sentenceIndex
                              ? 'bg-primary/10 border-2 border-primary/30 shadow-md'
                              : 'bg-background text-muted-foreground border border-border/50 hover:bg-muted/30'
                          }`}
                          onClick={() => onSentenceClick(topicIndex, sentenceIndex)}
                        >
                          <span className="flex-1">{sentence}</span>
                          <Edit 
                            className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity ml-2" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSentence(topicIndex, sentenceIndex);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="ml-4 space-y-2">
                {showSentenceInput[topicIndex] ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id={`sentence-input-${topicIndex}`}
                        value={sentenceInputs[topicIndex] || ""}
                        onChange={(e) => updateSentenceInput(topicIndex, e.target.value)}
                        placeholder="Add first sentence..."
                        className="text-sm bg-muted/20 border-muted focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSentence(topicIndex);
                          } else if (e.key === 'Escape') {
                            setShowSentenceInput(prev => ({ ...prev, [topicIndex]: false }));
                          }
                        }}
                      />
                      <Button
                        onClick={() => setShowSentenceInput(prev => ({ ...prev, [topicIndex]: false }))}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => toggleSentenceInput(topicIndex)}
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sentence
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        {showTopicInput ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                id="topic-input"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Add new topic question..."
                className="bg-muted/20 border-muted focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTopic();
                  } else if (e.key === 'Escape') {
                    setShowTopicInput(false);
                  }
                }}
              />
              <Button
                onClick={() => setShowTopicInput(false)}
                size="sm"
                variant="ghost"
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={toggleTopicInput}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-primary/5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Topic Question
          </Button>
        )}
      </div>
    </div>
  );
};
