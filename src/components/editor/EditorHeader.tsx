
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onPreview: () => void;
  onAnalyze: () => void;
}

export const EditorHeader = ({ title, onTitleChange, onPreview, onAnalyze }: EditorHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-background border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/")}
          className="rounded-full hover:bg-muted shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-lg sm:text-xl font-medium bg-transparent border-none px-0 focus:border-primary min-w-0"
          placeholder="Untitled Essay"
        />
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button
          onClick={onPreview}
          variant="outline"
          size="sm"
          className="hidden sm:flex"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        
        <Button
          onClick={onPreview}
          variant="outline"
          size="sm"
          className="sm:hidden"
        >
          <Eye className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={onAnalyze}
          size="sm"
          className="bg-primary hover:bg-primary/90 hidden sm:flex"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analyze
        </Button>
        
        <Button
          onClick={onAnalyze}
          size="sm"
          className="bg-primary hover:bg-primary/90 sm:hidden"
        >
          <BarChart3 className="w-4 h-4" />
        </Button>
        
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
