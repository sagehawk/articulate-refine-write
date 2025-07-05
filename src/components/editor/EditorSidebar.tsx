
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { EssayData } from "@/types/essay";

interface EditorSidebarProps {
  essayData: EssayData;
  selectedTopicIndex: number | null;
  selectedSentenceIndex: number | null;
  onAddTopic: (topic: string) => void;
  onAddSentence: (topicIndex: number, sentence: string) => void;
  onSentenceClick: (topicIndex: number, sentenceIndex: number) => void;
}

export const EditorSidebar = ({
  essayData,
  selectedTopicIndex,
  selectedSentenceIndex,
  onAddTopic,
  onAddSentence,
  onSentenceClick
}: EditorSidebarProps) => {
  const [topicInput, setTopicInput] = useState("");
  const [sentenceInputs, setSentenceInputs] = useState<{[key: number]: string}>({});

  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    onAddTopic(topicInput.trim());
    setTopicInput("");
  };

  const handleAddSentence = (topicIndex: number) => {
    const currentInput = sentenceInputs[topicIndex] || "";
    if (!currentInput.trim()) return;
    onAddSentence(topicIndex, currentInput.trim());
    setSentenceInputs(prev => ({ ...prev, [topicIndex]: "" }));
  };

  const updateSentenceInput = (topicIndex: number, value: string) => {
    setSentenceInputs(prev => ({ ...prev, [topicIndex]: value }));
  };

  return (
    <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col lg:min-h-0">
      <div className="p-4 sm:p-6 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Essay Outline</h3>
        
        <div className="space-y-3 max-h-60 lg:max-h-none overflow-y-auto">
          {essayData.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="space-y-2">
              <div className="font-semibold text-lg p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                {topic}
              </div>
              
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
                      onClick={() => onSentenceClick(topicIndex, sentenceIndex)}
                    >
                      {sentence}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="ml-4 space-y-2">
                <Input
                  value={sentenceInputs[topicIndex] || ""}
                  onChange={(e) => updateSentenceInput(topicIndex, e.target.value)}
                  placeholder="Add first sentence..."
                  className="text-sm bg-muted/20 border-muted focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSentence(topicIndex);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAddSentence(topicIndex)}
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
                handleAddTopic();
              }
            }}
          />
          <Button
            onClick={handleAddTopic}
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
  );
};
