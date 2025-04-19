
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalSentence: string;
  onSelectSuggestion: (suggestion: string) => void;
  suggestions: string[];
  isLoading: boolean;
}

export function AISuggestionsModal({
  isOpen,
  onClose,
  originalSentence,
  onSelectSuggestion,
  suggestions,
  isLoading
}: AISuggestionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Suggestions</DialogTitle>
          <DialogDescription>
            Choose from these AI-generated alternatives for your sentence
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <div className="text-sm font-medium text-slate-500 mb-1">Original:</div>
            <div className="text-slate-700">{originalSentence}</div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-600">Generating suggestions...</span>
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border border-slate-200 p-4">
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left whitespace-normal h-auto p-4 hover:bg-blue-50 hover:text-blue-700 border-blue-100"
                      onClick={() => {
                        onSelectSuggestion(suggestion.replace(/^\d+\.\s*/, ''));
                        onClose();
                        toast("Suggestion applied", {
                          description: "The selected suggestion has replaced your original sentence.",
                        });
                      }}
                    >
                      {suggestion}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
