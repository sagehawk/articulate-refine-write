
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AICoach } from "@/components/AICoach";
import { Wand2 } from "lucide-react";

interface SelectionInfo {
  text: string;
  x: number;
  y: number;
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
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
  const [showAICoach, setShowAICoach] = useState(false);

  const handleInput = () => {
    if (!editorRef.current) return;
    const { innerText } = editorRef.current;
    const firstSentenceEndIndex = innerText.indexOf(firstSentence) + firstSentence.length;
    const newParagraph = innerText.substring(firstSentenceEndIndex).trim();

    if (newParagraph !== paragraphContent) {
      onContentChange(newParagraph);
    }
    // First sentence editing is implicitly handled by the parent state
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 10) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current?.getBoundingClientRect();
      if (!editorRect) return;

      setSelectionInfo({
        text: selection.toString().trim(),
        x: rect.right + 5, // Position to the right of selection
        y: rect.top - editorRect.top + rect.height / 2, // Center vertically
      });
      setShowAICoach(false); // Hide full coach on new selection
    } else {
      setSelectionInfo(null);
      setShowAICoach(false);
    }
  };

  const handleWandClick = () => {
    setShowAICoach(true);
  };

  const closeAICoach = () => {
    setShowAICoach(false);
    setSelectionInfo(null);
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
          
          {selectionInfo && !showAICoach && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleWandClick}
              className="absolute z-10 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              style={{ top: `${selectionInfo.y - 16}px`, left: `${selectionInfo.x}px` }}
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          )}

          {selectionInfo && showAICoach && (
            <div 
              className="absolute z-20"
              style={{ 
                top: `${selectionInfo.y - 20}px`, 
                left: `${selectionInfo.x + 40}px` 
              }}
            >
              <AICoach
                selectedText={selectionInfo.text}
                onClose={closeAICoach}
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
