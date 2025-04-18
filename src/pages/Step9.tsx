import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step9Data } from "@/types/essay";
import { completeEssay, getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertCircle, Check, Download, Eye, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

const Step9 = () => {
  const navigate = useNavigate();
  const [bibliography, setBibliography] = useState<string>("");
  const [formattingChecks, setFormattingChecks] = useState({
    doubleSpaced: false,
    titlePage: false,
    citationsChecked: false,
  });
  const [finalEssay, setFinalEssay] = useState<string>("");
  const [essayData, setEssayData] = useState<EssayData | null>(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        let paragraphs: string[] = [];
        
        if (data.step8?.newParagraphs && data.step8.newParagraphs.some(p => p.trim())) {
          paragraphs = data.step8.newParagraphs.filter(p => p.trim());
        } else if (data.step5?.paragraphs) {
          const originalParagraphs = data.step5.paragraphs;
          
          if (data.step7?.paragraphOrder) {
            paragraphs = data.step7.paragraphOrder.map(index => originalParagraphs[index]);
          } else {
            paragraphs = originalParagraphs;
          }
        }
        
        setFinalEssay(paragraphs.join("\n\n"));
        
        if (data.step9) {
          setBibliography(data.step9.bibliography || "");
          setFormattingChecks(data.step9.formattingChecks || {
            doubleSpaced: false,
            titlePage: false,
            citationsChecked: false,
          });
        }
      }
    }
  }, []);

  const handleBibliographyChange = (value: string) => {
    setBibliography(value);
  };

  const toggleFormattingCheck = (key: keyof typeof formattingChecks) => {
    setFormattingChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const exportEssay = () => {
    const fullEssay = `${finalEssay}\n\n${bibliography ? "References\n\n" + bibliography : ""}`;
    
    const element = document.createElement("a");
    const file = new Blob([fullEssay], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${essayData?.essay.title || "essay"}.txt`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast("Essay Exported", {
      description: "Your essay has been downloaded as a text file.",
    });
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

  const handleSave = (data: EssayData) => {
    if (data) {
      data.step9 = {
        bibliography: bibliography,
        formattingChecks: formattingChecks
      };
      
      saveEssayData(data);
    }
  };

  const allChecksDone = Object.values(formattingChecks).every(Boolean);
  const hasBibliography = bibliography.trim().length > 0;
  
  const canProceed = hasBibliography && allChecksDone;

  return (
    <StepLayout 
      step={9} 
      totalSteps={9}
      onSave={handleSave}
      canProceed={true}
      onComplete={handleComplete}
    >
      <h2 className="text-2xl font-nunito font-bold text-green-800 mb-6">
        References & Formatting
      </h2>

      <Card className="mb-8 border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
          <CardTitle>Finalize Your Essay</CardTitle>
          <CardDescription>
            Add citations, check formatting, and prepare for submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Peterson emphasizes that proper citations and formatting are essential for academic 
            integrity and professionalism. Complete your bibliography and use the checklist 
            to ensure your essay meets all submission requirements.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <Button 
              onClick={exportEssay} 
              variant="outline"
              className="space-x-1 border-green-200 hover:bg-green-50"
            >
              <Download className="h-4 w-4" />
              <span>Export as Text</span>
            </Button>
            
            <Button
              onClick={handleComplete}
              className="space-x-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              <span>Mark as Complete</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {finalEssay ? (
        <Tabs defaultValue="bibliography" className="w-full space-y-6">
          <TabsList className="bg-green-50">
            <TabsTrigger value="bibliography" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Bibliography</TabsTrigger>
            <TabsTrigger value="formatting" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Formatting Checklist</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Preview Essay</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bibliography" className="space-y-6">
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle>Bibliography / References</CardTitle>
                <CardDescription>
                  Add your citations following your preferred style (APA, MLA, Chicago, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-slate-800">References List</h3>
                    <a 
                      href="https://owl.purdue.edu/owl/research_and_citation/resources.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Citation Style Guides</span>
                    </a>
                  </div>
                  
                  <Textarea
                    value={bibliography}
                    onChange={(e) => handleBibliographyChange(e.target.value)}
                    placeholder="Enter your bibliography/references here..."
                    className="min-h-[300px] font-mono text-sm border-green-100 focus-visible:ring-green-400"
                  />
                  
                  <p className="text-xs text-slate-500 mt-2">
                    Enter each citation on a new line. Follow your required citation style consistently.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="formatting" className="space-y-6">
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle>Formatting Checklist</CardTitle>
                <CardDescription>
                  Ensure your essay meets all formatting requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="doubleSpaced" 
                      checked={formattingChecks.doubleSpaced}
                      onCheckedChange={() => toggleFormattingCheck("doubleSpaced")}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="doubleSpaced"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Double-spaced text
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Ensure your essay is double-spaced according to academic standards.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="titlePage" 
                      checked={formattingChecks.titlePage}
                      onCheckedChange={() => toggleFormattingCheck("titlePage")}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="titlePage"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Title page included
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Your essay includes a properly formatted title page with your name, course information, and date.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="citationsChecked" 
                      checked={formattingChecks.citationsChecked}
                      onCheckedChange={() => toggleFormattingCheck("citationsChecked")}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="citationsChecked"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Citations verified
                      </label>
                      <p className="text-sm text-muted-foreground">
                        All quotes and paraphrased material are properly cited in the text and in the bibliography.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            <Card className="border-green-100">
              <CardHeader>
                <CardTitle>Essay Preview</CardTitle>
                <CardDescription>
                  Review your completed essay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {finalEssay.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                  
                  {bibliography && (
                    <>
                      <h3 className="text-lg font-semibold mt-8 mb-4">References</h3>
                      <div className="whitespace-pre-line font-mono text-sm">
                        {bibliography}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to create paragraphs in the previous steps before finalizing your essay.
          </AlertDescription>
        </Alert>
      )}
    </StepLayout>
  );
};

export default Step9;
