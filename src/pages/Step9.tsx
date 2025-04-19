import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step9Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData, completeEssay } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, List, Copy, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Step9 = () => {
  const navigate = useNavigate();
  const [bibliography, setBibliography] = useState("");
  const [formattingChecks, setFormattingChecks] = useState({
    doubleSpaced: false,
    titlePage: false,
    citationsChecked: false
  });
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [essayPreview, setEssayPreview] = useState("");
  const [bibliographySource, setBibliographySource] = useState("");
  const [bibliographyFormat, setBibliographyFormat] = useState("MLA");
  const [showFormatting, setShowFormatting] = useState(false);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        // Load bibliography if it exists
        if (data.step9?.bibliography) {
          setBibliography(data.step9.bibliography);
        }
        
        // Load formatting checks if they exist
        if (data.step9?.formattingChecks) {
          setFormattingChecks(data.step9.formattingChecks);
        }
        
        // Generate essay preview based on paragraphs from step 5 or later
        generateEssayPreview(data);
      }
    }
  }, []);

  const generateEssayPreview = (data: EssayData) => {
    // Use the most recent version of paragraphs
    let paragraphs: string[] = [];
    
    // Check for the latest paragraphs (in reverse order of steps)
    if (data.step8?.newParagraphs && data.step8.newParagraphs.length > 0) {
      paragraphs = data.step8.newParagraphs;
    } else if (data.step5?.paragraphs && data.step5.paragraphs.length > 0) {
      paragraphs = data.step5.paragraphs;
    }
    
    // Join paragraphs with double newlines
    const preview = paragraphs.join("\n\n");
    setEssayPreview(preview);
  };

  const handleBibliographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBibliography(e.target.value);
  };

  const handleCheckChange = (key: keyof typeof formattingChecks, checked: boolean) => {
    setFormattingChecks(prev => ({ ...prev, [key]: checked }));
  };
  
  const handleBibliographySourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBibliographySource(e.target.value);
  };
  
  const generateBibliographyEntry = () => {
    if (!bibliographySource.trim()) {
      toast("Please enter a source", {
        description: "Enter a URL, book title, or article name"
      });
      return;
    }
    
    // For now, we'll just create a simple bibliography entry based on the source
    // In a real app, this would call an API to generate proper citations
    const today = new Date();
    const formattedDate = `${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()}`;
    
    let newEntry = "";
    if (bibliographySource.startsWith("http")) {
      // It's a URL
      if (bibliographyFormat === "MLA") {
        newEntry = `"${bibliographySource.split("/")[2]}." Web. ${formattedDate}.`;
      } else if (bibliographyFormat === "APA") {
        newEntry = `Retrieved from ${bibliographySource} on ${formattedDate}.`;
      } else {
        newEntry = `${bibliographySource} (accessed ${formattedDate})`;
      }
    } else {
      // It's a book or article
      if (bibliographyFormat === "MLA") {
        newEntry = `"${bibliographySource}." Print. ${formattedDate}.`;
      } else if (bibliographyFormat === "APA") {
        newEntry = `${bibliographySource}. (${today.getFullYear()}).`;
      } else {
        newEntry = `${bibliographySource} (${today.getFullYear()})`;
      }
    }
    
    // Append to existing bibliography
    const updatedBibliography = bibliography 
      ? `${bibliography}\n\n${newEntry}` 
      : newEntry;
      
    setBibliography(updatedBibliography);
    setBibliographySource("");
    
    toast("Bibliography entry added", {
      description: `Added in ${bibliographyFormat} format`
    });
  };
  
  const copyToClipboard = () => {
    const essay = essayData?.essay.title 
      ? `${essayData.essay.title}\n\n${essayPreview}\n\nBibliography:\n${bibliography}`
      : `${essayPreview}\n\nBibliography:\n${bibliography}`;
    
    navigator.clipboard.writeText(essay).then(() => {
      toast("Copied to clipboard", {
        description: "Your essay has been copied to the clipboard"
      });
    });
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      data.step9 = {
        bibliography,
        formattingChecks
      };
      
      saveEssayData(data);
    }
  };

  const handleComplete = () => {
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      completeEssay(activeEssayId);
      toast("Essay Completed!", {
        description: "Your essay has been marked as complete.",
      });
      navigate("/");
    }
  };

  const exportToText = () => {
    if (!essayData) return;
    
    // Create text content with title, paragraphs, and bibliography
    const content = `${essayData.essay.title}\n\n${essayPreview}\n\nBibliography:\n${bibliography}`;
    
    // Create a blob and download it
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${essayData.essay.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowFormatting(true);
  };

  // Calculate if can proceed: essay has content and bibliography is not empty
  const canProceed = essayPreview.trim().length > 0 && bibliography.trim().length > 0;

  return (
    <StepLayout 
      step={9} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={true}
      onComplete={handleComplete}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        References & Formatting
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{essayData?.essay.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 h-64 overflow-y-auto">
                <p className="whitespace-pre-line text-sm text-slate-700">
                  {essayPreview}
                </p>
              </div>
              <div className="flex mt-4 space-x-2">
                <Button 
                  onClick={exportToText}
                  className="space-x-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Export to Text</span>
                </Button>
                <Button 
                  onClick={copyToClipboard}
                  variant="outline"
                  className="space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy to Clipboard</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {showFormatting && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <List className="mr-2 h-5 w-5" />
                  <span>Formatting Checklist</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="doubleSpaced" 
                    checked={formattingChecks.doubleSpaced} 
                    onCheckedChange={(checked) => handleCheckChange('doubleSpaced', !!checked)} 
                  />
                  <Label htmlFor="doubleSpaced" className="leading-tight">
                    Double-spaced throughout
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="titlePage" 
                    checked={formattingChecks.titlePage} 
                    onCheckedChange={(checked) => handleCheckChange('titlePage', !!checked)}
                  />
                  <Label htmlFor="titlePage" className="leading-tight">
                    Title page with name, course, date
                  </Label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="citationsChecked" 
                    checked={formattingChecks.citationsChecked} 
                    onCheckedChange={(checked) => handleCheckChange('citationsChecked', !!checked)}
                  />
                  <Label htmlFor="citationsChecked" className="leading-tight">
                    All citations are properly formatted
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bibliography</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="bibliography-source">Add Source</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="bibliography-source" 
                      placeholder="Enter URL, book title, or article"
                      value={bibliographySource}
                      onChange={handleBibliographySourceChange}
                    />
                    <Button 
                      onClick={generateBibliographyEntry} 
                      className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Format
                    </Button>
                  </div>
                  <div className="flex space-x-2 mt-1">
                    <Button 
                      variant={bibliographyFormat === "MLA" ? "secondary" : "outline"}
                      onClick={() => setBibliographyFormat("MLA")}
                      size="sm"
                    >
                      MLA
                    </Button>
                    <Button 
                      variant={bibliographyFormat === "APA" ? "secondary" : "outline"}
                      onClick={() => setBibliographyFormat("APA")}
                      size="sm"
                    >
                      APA
                    </Button>
                    <Button 
                      variant={bibliographyFormat === "Chicago" ? "secondary" : "outline"}
                      onClick={() => setBibliographyFormat("Chicago")}
                      size="sm"
                    >
                      Chicago
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Enter your bibliography here..."
                  value={bibliography}
                  onChange={handleBibliographyChange}
                  className="h-64"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step9;
