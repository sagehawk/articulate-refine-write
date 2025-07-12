
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AICoach } from "@/components/AICoach";
import { Wand2 } from "lucide-react";

interface SelectedText {
  text: string;
  start: number;
  end: number;
}

interface ParagraphEditorProps {
  firstSentence: string;
  paragraphContent: string;
  onContentChange: (content: string) => void;
}

export const ParagraphEditor = ({ firstSentence, paragraphContent, onContentChange }: ParagraphEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiCoachPosition, setAiCoachPosition] = useState({ x: 0, y: 0 });

  const handleAICoachClick = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.substring(start, end);

    if (text.trim().length > 0) {
      setSelectedText({ text: text.trim(), start, end });
    } else {
      setSelectedText({ text: paragraphContent, start: 0, end: paragraphContent.length });
    }
    
    const rect = textarea.getBoundingClientRect();
    setAiCoachPosition({
      x: rect.right - 320,
      y: rect.top + 60
    });

    setShowAICoach(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Write Your Paragraph</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Start with your first sentence below, then expand it into a full paragraph with evidence and analysis.
        </p>
      </div>

      {/* First Sentence Display */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-1 h-16 bg-primary rounded-full shrink-0"></div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Your Opening Sentence</h3>
            <p className="font-lora text-xl sm:text-2xl leading-relaxed text-foreground font-medium">
              {firstSentence}
            </p>
          </div>
        </div>
      </div>

      {/* Writing Instructions */}
      <div className="bg-muted/30 border border-muted rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-2">💡 Writing Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Expand on your opening sentence with supporting evidence</li>
          <li>• Include examples, data, or quotes to strengthen your argument</li>
          <li>• End with analysis that connects back to your main point</li>
          <li>• Select text and use AI Coach for writing suggestions</li>
        </ul>
      </div>

      {/* Paragraph Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Develop Your Paragraph</h3>
          <Button
            onClick={handleAICoachClick}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            AI Coach
          </Button>
        </div>
        
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={paragraphContent}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Start writing your paragraph here. Build on your opening sentence with evidence, examples, and analysis..."
            className="min-h-[400px] sm:min-h-[500px] text-lg sm:text-xl font-lora leading-relaxed resize-none border-2 focus:border-primary p-6 bg-background"
          />
          
          {showAICoach && selectedText && (
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
        
        <div className="text-sm text-muted-foreground text-center">
          {paragraphContent.split(/\s+/).filter(word => word.length > 0).length} words
        </div>
      </div>
    </div>
  );
};
