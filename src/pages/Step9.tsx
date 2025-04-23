
import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const Step9 = () => {
  const [bibliography, setBibliography] = useState("");
  const [formattingChecks, setFormattingChecks] = useState({
    doubleSpaced: false,
    titlePage: false,
    citationsChecked: false
  });
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [bibliographySource, setBibliographySource] = useState("");
  const [bibliographyFormat, setBibliographyFormat] = useState("MLA");

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
      }
    }
  }, []);

  const handleBibliographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBibliography = e.target.value;
    setBibliography(newBibliography);
    
    // Update the essay data
    if (essayData) {
      if (!essayData.step9) {
        essayData.step9 = {
          bibliography: newBibliography,
          formattingChecks: formattingChecks
        };
      } else {
        essayData.step9.bibliography = newBibliography;
      }
    }
  };

  const handleCheckChange = (key: keyof typeof formattingChecks, checked: boolean) => {
    const newChecks = { ...formattingChecks, [key]: checked };
    setFormattingChecks(newChecks);
    
    // Update the essay data
    if (essayData && essayData.step9) {
      essayData.step9.formattingChecks = newChecks;
    }
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
    
    // Update the essay data
    if (essayData) {
      if (!essayData.step9) {
        essayData.step9 = {
          bibliography: updatedBibliography,
          formattingChecks: formattingChecks
        };
      } else {
        essayData.step9.bibliography = updatedBibliography;
      }
    }
    
    toast("Bibliography entry added", {
      description: `Added in ${bibliographyFormat} format`
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

  // Calculate if can proceed: bibliography is not empty
  const canProceed = bibliography.trim().length > 0;

  return (
    <StepLayout 
      step={9} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={canProceed}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        References & Formatting
      </h2>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bibliography</CardTitle>
            <CardDescription>
              Add references and citations to your essay
            </CardDescription>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Formatting Checklist</CardTitle>
            <CardDescription>
              Ensure your essay follows proper formatting standards
            </CardDescription>
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
        
        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => {
              const activeEssayId = getActiveEssay();
              if (activeEssayId && essayData) {
                handleSave(essayData);
                toast.success("Essay completed!", {
                  description: "Your essay has been finalized. Great job!"
                });
              }
            }}
            className="bg-green-600 hover:bg-green-700 py-6 px-8 text-lg flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            Complete Essay
          </Button>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step9;
