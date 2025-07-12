
import { useRef, useState, memo } from "react";
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

import { useRef, useState, useEffect } from "react";
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
  const [isFocused, setIsFocused] = useState(false);

  // Use a ref to store the current content to avoid re-renders
  const currentContentRef = useRef<string>("");

  useEffect(() => {
    // Initialize contentEditable div content when component mounts or props change
    // Only update if not focused to avoid disrupting user input
    if (editorRef.current && !isFocused) {
      const combinedContent = `<span class="first-sentence font-bold text-primary">${firstSentence}</span> ${paragraphContent}`;
      editorRef.current.innerHTML = combinedContent;
      currentContentRef.current = editorRef.current.innerText; // Store the initial text
    }
  }, [firstSentence, paragraphContent, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      currentContentRef.current = editorRef.current.innerText;
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!editorRef.current) return;

    const fullText = editorRef.current.innerText;

    // Parse first sentence and paragraph content based on lines
    // Use a regex to find the first sentence (ending with .?!) and the rest of the paragraph
    const sentenceRegex = /^([^.!?]*[.!?])\s*(.*)$/s;
    const match = fullText.match(sentenceRegex);

    let newFirstSentence = '';
    let newParagraphContent = '';

    if (match) {
      newFirstSentence = match[1].trim();
      newParagraphContent = match[2].trim();
    } else {
      // If no sentence-ending punctuation, treat the whole text as the first sentence
      newFirstSentence = fullText.trim();
      newParagraphContent = '';
    }

    if (newFirstSentence !== firstSentence) {
      onFirstSentenceChange(newFirstSentence);
    }
    if (newParagraphContent !== paragraphContent) {
      onContentChange(newParagraphContent);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
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
        x: rect.right + 5,
        y: rect.top - editorRect.top + rect.height / 2,
      });
      setShowAICoach(false);
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

  const fullParagraphTextForWordCount = currentContentRef.current;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
            onBlur={handleBlur}
            onFocus={handleFocus}
            onMouseUp={handleTextSelection}
            suppressContentEditableWarning={true}
            className="min-h-[400px] sm:min-h-[500px] text-lg sm:text-xl font-lora leading-relaxed resize-none border-2 focus:border-primary p-6 bg-background focus:outline-none"
          >
            {/* Content is managed by useEffect and browser */}
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
          {fullParagraphTextForWordCount.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>
    </div>
  );
};
