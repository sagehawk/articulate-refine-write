
import { useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { AICoach } from "@/components/AICoach";

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
  const [selectedText, setSelectedText] = useState<SelectedText>({ text: '', start: 0, end: 0 });
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiCoachPosition, setAiCoachPosition] = useState({ x: 0, y: 0 });

  const handleTextSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!textareaRef.current) return;
    
    setTimeout(() => {
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value.substring(start, end);
      
      if (text.trim().length > 10 && text.trim().length < 500) {
        const rect = textarea.getBoundingClientRect();
        setAiCoachPosition({
          x: rect.right - 320,
          y: rect.top + 60
        });
        
        setSelectedText({ text: text.trim(), start, end });
        setShowAICoach(true);
      } else {
        setShowAICoach(false);
      }
    }, 100);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Write Your Paragraph</h1>
        <div className="p-6 sm:p-8 bg-primary/5 rounded-lg border-l-4 border-primary">
          <p className="font-lora text-2xl sm:text-3xl leading-relaxed text-foreground font-medium">
            {firstSentence}
          </p>
        </div>
        <p className="text-xl sm:text-2xl text-muted-foreground">
          Expand on this sentence. Develop your argument with evidence and analysis.
        </p>
      </div>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={paragraphContent}
          onChange={(e) => onContentChange(e.target.value)}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          placeholder="Start writing your paragraph here. Develop your argument with evidence, examples, and analysis..."
          className="min-h-[400px] sm:min-h-[500px] text-lg sm:text-xl font-lora leading-relaxed resize-none border-2 focus:border-primary p-6"
        />
        
        {showAICoach && selectedText.text && (
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
    </div>
  );
};
