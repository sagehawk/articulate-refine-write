
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EssayData } from "@/types/essay";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  essayData: EssayData;
}

export const PreviewModal = ({ isOpen, onClose, essayData }: PreviewModalProps) => {
  const renderEssay = () => {
    if (!essayData) return null;

    const essayContent = [];
    
    if (essayData.topics && Array.isArray(essayData.topics)) {
      essayData.topics.forEach((topic, topicIndex) => {
        essayContent.push(
          <div key={`topic-${topicIndex}`} className="mb-8">
            <h2 className="text-2xl font-lora font-semibold mb-4 text-foreground">{topic}</h2>
            {essayData.paragraphs && 
             essayData.paragraphs[topicIndex] && 
             Array.isArray(essayData.paragraphs[topicIndex]) &&
             essayData.paragraphs[topicIndex].map((paragraph: string, paragraphIndex: number) => (
              <p key={`paragraph-${topicIndex}-${paragraphIndex}`} className="font-lora text-lg leading-relaxed mb-4 text-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        );
      });
    }

    return essayContent;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">{essayData.essay.title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="mt-6">
          <article className="prose prose-lg max-w-none font-lora">
            {renderEssay()}
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
};
