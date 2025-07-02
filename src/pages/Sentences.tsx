
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Sentences = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [sentences, setSentences] = useState<{[key: number]: string[]}>({});
  const [currentInput, setCurrentInput] = useState("");

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (!activeEssayId) {
      navigate("/");
      return;
    }

    const data = getEssayData(activeEssayId);
    if (!data || !data.topics || data.topics.length === 0) {
      navigate("/topics");
      return;
    }

    setEssayData(data);
    if (data.sentences) {
      setSentences(data.sentences);
    }
  }, [navigate]);

  const handleAddSentence = () => {
    if (currentInput.trim()) {
      const newSentences = {
        ...sentences,
        [currentTopicIndex]: [...(sentences[currentTopicIndex] || []), currentInput.trim()]
      };
      setSentences(newSentences);
      setCurrentInput("");
      
      if (essayData) {
        const updatedData = { ...essayData, sentences: newSentences };
        setEssayData(updatedData);
        saveEssayData(updatedData);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSentence();
    }
  };

  const removeSentence = (sentenceIndex: number) => {
    const topicSentences = sentences[currentTopicIndex] || [];
    const newTopicSentences = topicSentences.filter((_, i) => i !== sentenceIndex);
    const newSentences = { ...sentences, [currentTopicIndex]: newTopicSentences };
    setSentences(newSentences);
    
    if (essayData) {
      const updatedData = { ...essayData, sentences: newSentences };
      setEssayData(updatedData);
      saveEssayData(updatedData);
    }
  };

  const handleNextTopic = () => {
    if (currentTopicIndex < essayData.topics.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1);
    } else {
      navigate("/paragraphs");
    }
  };

  const handlePreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1);
    }
  };

  if (!essayData) return null;

  const currentTopicSentences = sentences[currentTopicIndex] || [];
  const progress = ((currentTopicIndex + 1) / essayData.topics.length) * 25 + 12.5;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 border-b">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/topics")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Progress value={progress} className="flex-1 mx-6" />
          <div className="text-sm text-muted-foreground">Step 2 of 8</div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">First Sentences</h1>
            <div className="p-4 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold text-card-foreground">
                {essayData.topics[currentTopicIndex]}
              </h2>
            </div>
            <p className="text-muted-foreground">
              Write the first sentence of each paragraph for this topic
            </p>
          </div>

          <div className="space-y-6">
            {currentTopicSentences.map((sentence, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border group">
                <div className="flex-1 text-card-foreground leading-relaxed">{sentence}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSentence(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-3">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write the first sentence of a paragraph..."
                className="flex-1 h-12 text-lg"
                autoFocus
              />
              <Button onClick={handleAddSentence} size="lg" disabled={!currentInput.trim()}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousTopic}
              disabled={currentTopicIndex === 0}
            >
              Previous Topic
            </Button>
            
            {currentTopicSentences.length > 0 && (
              <Button onClick={handleNextTopic}>
                {currentTopicIndex < essayData.topics.length - 1 ? 'Next Topic' : 'Continue to Paragraphs'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sentences;
