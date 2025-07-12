
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  onFirstSentenceChange: (newSentence: string) => void;
}

export const ParagraphEditor = ({ 
  firstSentence, 
  paragraphContent, 
  onContentChange, 
  onFirstSentenceChange 
}: ParagraphEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [showAICoach, setShowAICoach] = useState(false);
  const [aiCoachPosition, setAiCoachPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (editorRef.current) {
      const firstSentenceEl = editorRef.current.querySelector('.first-sentence');
      if (firstSentenceEl) {
        firstSentenceEl.textContent = firstSentence;
      }
      // The rest of the content is managed by the contentEditable div itself
    }
  }, [firstSentence]);

  const handleInput = () => {
    if (editorRef.current) {
      const firstSentenceEl = editorRef.current.querySelector('.first-sentence');
      if (firstSentenceEl && firstSentenceEl.textContent !== firstSentence) {
        onFirstSentenceChange(firstSentenceEl.textContent || '');
      }

      const paragraph = editorRef.current.innerText.replace(firstSentence, '').trim();
      onContentChange(paragraph);
    }
  };

  const handleAICoachClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const text = selection.toString();

    if (text.trim().length > 0) {
      setSelectedText({ text: text.trim(), start: range.startOffset, end: range.endOffset });
    } else if (editorRef.current) {
      setSelectedText({ text: editorRef.current.innerText, start: 0, end: editorRef.current.innerText.length });
    }
    
    const rect = range.getBoundingClientRect();
    setAiCoachPosition({
      x: rect.right - 320,
      y: rect.top + 60
    });

    setShowAICoach(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ... (header and other sections remain the same) ... */}

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
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            suppressContentEditableWarning={true}
            className="min-h-[400px] sm:min-h-[500px] text-lg sm:text-xl font-lora leading-relaxed resize-none border-2 focus:border-primary p-6 bg-background focus:outline-none"
          >
            <span className="first-sentence font-bold text-primary">{firstSentence}</span>
            {paragraphContent}
          </div>
          
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
          {/* Word count logic might need adjustment for contentEditable div */}
        </div>
      </div>
    </div>
  );
};
