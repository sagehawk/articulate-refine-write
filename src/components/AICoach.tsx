
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wand2, Loader2 } from "lucide-react";

interface AICoachProps {
  selectedText: string;
  onSuggestion: (suggestion: string) => void;
}

export const AICoach = ({ selectedText, onSuggestion }: AICoachProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const getSuggestion = async () => {
    if (!selectedText.trim()) return;
    
    setIsLoading(true);
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !suggestion && !isLoading) {
      getSuggestion();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        >
          <Wand2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">AI Writing Coach</h4>
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            "{selectedText}"
          </div>
          
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing your text...
            </div>
          ) : suggestion ? (
            <div className="space-y-2">
              <p className="text-sm text-foreground">{suggestion}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onSuggestion(suggestion)}
                className="w-full"
              >
                Apply Suggestion
              </Button>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
};
