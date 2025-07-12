
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AICoach } from "@/components/AICoach";
import { Wand2 } from "lucide-react";

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
  const [aiCoachText, setAiCoachText] = useState<string | null>(null);
  const [aiCoachPosition, setAiCoachPosition] = useState({ x: 0, y: 0 });

  const handleInput = () => {
    if (editorRef.current) {
      const firstSentenceEl = editorRef.current.querySelector('.first-sentence');
      const currentFullText = editorRef.current.innerText;
      
      let newFirstSentence = '';
      let newParagraphContent = '';

      if (firstSentenceEl && firstSentenceEl.textContent) {
        newFirstSentence = firstSentenceEl.textContent;
        newParagraphContent = currentFullText.substring(newFirstSentence.length).trim();
      } else {
        // Fallback if span is removed or empty
        const firstSentenceBoundary = currentFullText.indexOf('.') + 1;
        if (firstSentenceBoundary > 0) {
          newFirstSentence = currentFullText.substring(0, firstSentenceBoundary);
          newParagraphContent = currentFullText.substring(firstSentenceBoundary).trim();
        } else {
          newFirstSentence = currentFullText;
        }
      }

      if (newFirstSentence !== firstSentence) {
        onFirstSentenceChange(newFirstSentence);
      }
      if (newParagraphContent !== paragraphContent) {
        onContentChange(newParagraphContent);
      }
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length <= 10) {
      setAiCoachText(null);
      return;
    }

    const selectedText = selection.toString().trim();
    setAiCoachText(selectedText);

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setAiCoachPosition({ x: rect.right, y: rect.top });
  };

  const handleAICoachButtonClick = () => {
    if (!editorRef.current) return;
    const fullText = editorRef.current.innerText;
    setAiCoachText(fullText);

    const rect = editorRef.current.getBoundingClientRect();
    setAiCoachPosition({ x: rect.right, y: rect.top });
  };

  const fullParagraphText = `${firstSentence} ${paragraphContent}`.trim();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ... (header and other sections remain the same) ... */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Write Your Paragraph</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
          Start with your first sentence below, then expand it into a full paragraph with evidence and analysis.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Develop Your Paragraph</h3>
          <Button
            onClick={handleAICoachButtonClick}
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
            onMouseUp={handleTextSelection}
            suppressContentEditableWarning={true}
            className="min-h-[400px] sm:min-h-[500px] text-lg sm:text-xl font-lora leading-relaxed resize-none border-2 focus:border-primary p-6 bg-background focus:outline-none"
          >
            <span className="first-sentence font-bold text-primary">{firstSentence}</span>{' '}
            {paragraphContent}
          </div>
          
          {aiCoachText && (
            <div 
              className="fixed z-50"
              style={{
                top: `${aiCoachPosition.y}px`,
                left: `${aiCoachPosition.x - 330}px`
              }}
            >
              <AICoach
                selectedText={aiCoachText}
                onClose={() => setAiCoachText(null)}
              />
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground text-center">
          {fullParagraphText.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>
    </div>
  );
};
