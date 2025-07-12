
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Loader, X } from "lucide-react";

interface AICoachProps {
  selectedText: string;
  onClose: () => void;
}

export const AICoach = ({ selectedText, onClose }: AICoachProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  const getSuggestion = async () => {
    if (!selectedText.trim()) return;
    
    setIsLoading(true);
    setSuggestion(""); // Clear previous suggestion
    try {
      const response = await fetch('/api/aiSuggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentence: selectedText,
          type: 'coach'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestion(data.suggestions[0]);
        } else {
          setSuggestion("Your writing looks good! Consider checking for clarity and conciseness.");
        }
      } else {
        setSuggestion("Unable to get AI suggestion at the moment. Try again later.");
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setSuggestion("Unable to get AI suggestion at the moment. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-72 sm:w-80 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">AI Writing Coach</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="min-h-[80px] flex flex-col justify-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm">
              <Loader className="h-4 w-4 animate-spin" />
              Analyzing your text...
            </div>
          ) : suggestion ? (
            <div className="text-sm text-foreground leading-relaxed">
              {suggestion}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Get feedback on your writing.</p>
              <Button onClick={getSuggestion} size="sm" className="w-full">
                <Wand2 className="h-4 w-4 mr-2" />
                Analyze Selection
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
