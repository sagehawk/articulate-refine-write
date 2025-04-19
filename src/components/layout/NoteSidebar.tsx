
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  HelpCircle, 
  PenLine, 
  FileText,
  Save
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EssayData } from "@/types/essay";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { saveEssayData } from "@/utils/localStorage";

type NoteSidebarProps = {
  essayData: EssayData | null;
  onSaveNotes?: (notes: any) => void;
};

export function NoteSidebar({ essayData, onSaveNotes }: NoteSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reading" | "questions" | "outline" | "custom">("reading");
  const [showMemoryPopover, setShowMemoryPopover] = useState(false);
  
  // State for notes
  const [readingsList, setReadingsList] = useState<{title: string; notes: string}[]>([]);
  const [customNotes, setCustomNotes] = useState("");
  const [newReadingTitle, setNewReadingTitle] = useState("");
  const [newReadingNotes, setNewReadingNotes] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Default content for the sidebar tabs
  const topicQuestions = [
    { id: 1, text: "What is the main controversy in this area?", checked: false },
    { id: 2, text: "Who are the main authorities on this topic?", checked: false },
    { id: 3, text: "What evidence supports your position?", checked: false },
    { id: 4, text: "What counterarguments must you address?", checked: false },
    { id: 5, text: "How does your thesis add to the conversation?", checked: false },
  ];

  const outlinePoints = [
    { id: 1, text: "Introduction with clear thesis statement", checked: false },
    { id: 2, text: "Context/background for your topic", checked: false },
    { id: 3, text: "Supporting evidence for first main point", checked: false },
    { id: 4, text: "Supporting evidence for second main point", checked: false },
    { id: 5, text: "Address key counterarguments", checked: false },
    { id: 6, text: "Conclusion that reinforces thesis", checked: false },
  ];

  // Load readings from essay data
  useEffect(() => {
    if (essayData?.step3?.readings) {
      setReadingsList(essayData.step3.readings);
    }
    
    if (essayData?.step3?.notes) {
      setCustomNotes(essayData.step3.notes);
    }
  }, [essayData]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (id: number) => {
    // This would update the checked state and potentially save to local storage
  };
  
  const handleAddReading = () => {
    if (!newReadingTitle.trim()) {
      toast("Please enter a title", { 
        description: "Reading title cannot be empty" 
      });
      return;
    }
    
    const newReading = { 
      title: newReadingTitle, 
      notes: newReadingNotes 
    };
    
    const updatedReadings = [...readingsList, newReading];
    setReadingsList(updatedReadings);
    
    // Save to essayData
    if (essayData) {
      if (!essayData.step3) essayData.step3 = { topics: [], readings: [] };
      essayData.step3.readings = updatedReadings;
      saveEssayData(essayData);
      toast("Reading added", { description: "Your reading note has been saved" });
    }
    
    // Reset fields
    setNewReadingTitle("");
    setNewReadingNotes("");
  };
  
  const handleSaveCustomNotes = () => {
    if (essayData) {
      if (!essayData.step3) essayData.step3 = { topics: [], readings: [] };
      essayData.step3.notes = customNotes;
      saveEssayData(essayData);
      toast("Notes saved", { description: "Your custom notes have been saved" });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "reading":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium mb-3">Reading Notes</h3>
            
            {readingsList.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {readingsList.map((reading, idx) => (
                  <div key={idx} className="p-2 rounded bg-blue-50 border border-blue-100">
                    <div className="font-medium text-sm">{reading.title}</div>
                    <div className="text-xs mt-1 text-slate-600">{reading.notes}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">No reading notes yet</div>
            )}
            
            <div className="border-t pt-3 mt-4">
              <h4 className="text-xs font-medium mb-2">Add New Reading Note</h4>
              <Input 
                placeholder="Source title"
                value={newReadingTitle}
                onChange={(e) => setNewReadingTitle(e.target.value)}
                className="text-sm mb-2"
              />
              <Textarea
                placeholder="Your notes..."
                value={newReadingNotes}
                onChange={(e) => setNewReadingNotes(e.target.value)}
                className="text-sm mb-2 h-20"
              />
              <Button 
                onClick={handleAddReading} 
                size="sm" 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Add Reading
              </Button>
            </div>
          </div>
        );
      case "questions":
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-3">Topic Questions</h3>
            {topicQuestions.map((question) => (
              <div key={question.id} className="flex items-start space-x-2">
                <Checkbox id={`question-${question.id}`} checked={question.checked} onCheckedChange={() => handleCheckboxChange(question.id)} />
                <label htmlFor={`question-${question.id}`} className="text-sm leading-tight">{question.text}</label>
              </div>
            ))}
          </div>
        );
      case "outline":
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-3">Outline Checklist</h3>
            {outlinePoints.map((point) => (
              <div key={point.id} className="flex items-start space-x-2">
                <Checkbox id={`outline-${point.id}`} checked={point.checked} onCheckedChange={() => handleCheckboxChange(point.id)} />
                <label htmlFor={`outline-${point.id}`} className="text-sm leading-tight">{point.text}</label>
              </div>
            ))}
          </div>
        );
      case "custom":
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-3">Custom Notes</h3>
            <Textarea 
              className="w-full h-48 p-2 text-sm border rounded" 
              placeholder="Your custom notes here..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
            />
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-1"
              onClick={handleSaveCustomNotes}
            >
              <Save className="w-3 h-3" />
              <span>Save Notes</span>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={`fixed top-16 ${isOpen ? 'right-0' : '-right-[260px]'} h-[calc(100vh-4rem)] transition-all duration-300 z-30`}>
      <div className="relative h-full">
        <Button 
          variant="outline" 
          size="icon"
          className="absolute -left-10 top-5 h-10 w-10 rounded-full shadow-md bg-white"
          onClick={toggleSidebar}
        >
          {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        <div className="w-64 h-full bg-white border-l border-slate-200 flex flex-col shadow-lg">
          <div className="flex border-b p-3 justify-between items-center">
            <h2 className="font-medium text-slate-800">Essay Notes</h2>
            <Popover open={showMemoryPopover} onOpenChange={setShowMemoryPopover}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">About Writing from Memory</h4>
                  <p>Peterson suggests writing from memory to strengthen your understanding and create more original work.</p>
                  <p>Use this sidebar as a reference, but challenge yourself to write key sections without looking at your notes.</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="p-4 flex-grow overflow-auto">
            {renderContent()}
          </div>
          
          <div className="border-t p-3 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className={activeTab === "reading" ? "bg-slate-100" : ""}
              onClick={() => setActiveTab("reading")}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={activeTab === "questions" ? "bg-slate-100" : ""}
              onClick={() => setActiveTab("questions")}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={activeTab === "outline" ? "bg-slate-100" : ""}
              onClick={() => setActiveTab("outline")}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={activeTab === "custom" ? "bg-slate-100" : ""}
              onClick={() => setActiveTab("custom")}
            >
              <PenLine className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
