
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Topics = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [essayData, setEssayData] = useState(null);

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
    if (data.topics) {
      setTopics(data.topics);
    }
  }, [navigate]);

  const handleAddTopic = () => {
    if (currentInput.trim()) {
      const newTopics = [...topics, currentInput.trim()];
      setTopics(newTopics);
      setCurrentInput("");
      
      if (essayData) {
        const updatedData = { ...essayData, topics: newTopics };
        setEssayData(updatedData);
        saveEssayData(updatedData);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTopic();
    }
  };

  const removeTopic = (index: number) => {
    const newTopics = topics.filter((_, i) => i !== index);
    setTopics(newTopics);
    
    if (essayData) {
      const updatedData = { ...essayData, topics: newTopics };
      setEssayData(updatedData);
      saveEssayData(updatedData);
    }
  };

  const handleDone = () => {
    if (topics.length > 0) {
      navigate("/sentences");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 border-b">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Progress value={12.5} className="flex-1 mx-6" />
          <div className="text-sm text-muted-foreground">Step 1 of 8</div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">What's your topic question?</h1>
            <p className="text-muted-foreground">
              Break down your essay into key questions you want to explore
            </p>
          </div>

          <div className="space-y-6">
            {topics.map((topic, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-lg border group">
                <div className="flex-1 text-card-foreground">{topic}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTopic(index)}
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
                placeholder="Enter a topic question..."
                className="flex-1 h-12 text-lg"
                autoFocus
              />
              <Button onClick={handleAddTopic} size="lg" disabled={!currentInput.trim()}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {topics.length > 0 && (
            <div className="text-center">
              <Button onClick={handleDone} size="lg" className="px-8">
                Continue to First Sentences
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Topics;
