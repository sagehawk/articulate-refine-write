
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface InitialStateProps {
  onAddTopic: (topic: string) => void;
}

export const InitialState = ({ onAddTopic }: InitialStateProps) => {
  const [topicInput, setTopicInput] = useState("");

  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    onAddTopic(topicInput.trim());
    setTopicInput("");
  };

  return (
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
              handleAddTopic();
            }
          }}
          autoFocus
        />
        <Button
          onClick={handleAddTopic}
          disabled={!topicInput.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 sm:h-14 text-lg font-semibold w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Topic
        </Button>
      </div>
    </div>
  );
};
