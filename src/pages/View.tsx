
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getActiveEssay, getEssayData } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Eye, RefreshCw, AlertCircle, ArrowLeft, FileText, PenLine, BookCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Define the bibliography heading constant
const BIBLIOGRAPHY_HEADING = "Bibliography";

const View = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      try {
        const data = getEssayData(activeEssayId);
        if (data) {
          setEssayData(data);
        } else {
          setError("Could not load essay data. The essay might have been deleted or doesn't exist.");
        }
      } catch (e) {
        setError("Error loading essay data. Please try again.");
      }
    } else {
      setError("No active essay selected. Please return to the home page and select an essay.");
    }
    setLoading(false);
  }, []);

  const getParagraphs = () => {
    if (!essayData) return [];
    
    // Use step8 paragraphs if available (after restructuring)
    if (essayData.step8?.newParagraphs && essayData.step8.newParagraphs.length > 0) {
      return essayData.step8.newParagraphs;
    } 
    
    // Otherwise use the paragraphs from step5, which will include any reordering from step7
    if (essayData.step5?.paragraphs && essayData.step5.paragraphs.length > 0) {
      return essayData.step5.paragraphs;
    }
    
    return [];
  };

  const handleReturn = () => {
    // Return to the last step they were on or default to step9
    if (essayData?.essay?.currentStep) {
      navigate(`/step${essayData.essay.currentStep}`);
    } else {
      navigate("/step9");
    }
  };

  const returnHome = () => {
    navigate("/");
  };

  const handleContinueEditing = () => {
    navigate("/step9");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading essay preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error Loading Essay</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex justify-center">
            <Button onClick={returnHome} className="bg-blue-600 hover:bg-blue-700">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = getParagraphs();
  const hasParagraphs = paragraphs.length > 0;
  const hasBibliography = essayData?.step9?.bibliography && essayData.step9.bibliography.trim() !== "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={returnHome}
            className="flex items-center gap-2 border-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> 
            Return Home
          </Button>
          
          <div className="text-sm text-slate-500 italic">
            Preview Mode
          </div>
        </div>
        
        {!hasParagraphs && !error && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">No Content Yet</AlertTitle>
            <AlertDescription className="text-amber-700">
              Your essay doesn't have any content yet. Start by creating an outline and writing paragraphs.
            </AlertDescription>
          </Alert>
        )}
      
        <Card className="shadow-md border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="text-2xl font-nunito font-bold text-slate-800">
                {essayData?.essay.title || "Untitled Essay"}
              </CardTitle>
              {essayData?.step9?.formattingChecks?.titlePage && (
                <div className="text-sm text-slate-500 mt-1">
                  Author
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none pt-8 pb-12">
            {hasParagraphs ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className={`mb-6 text-slate-700 leading-${essayData?.step9?.formattingChecks?.doubleSpaced ? '8' : 'relaxed'}`}>
                  {paragraph}
                </p>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                No content available. Start by adding content in the editor.
              </div>
            )}

            {hasBibliography && (
              <>
                <Separator className="my-8" />
                <h2 className="text-xl font-semibold mb-4">{BIBLIOGRAPHY_HEADING}</h2>
                <div className="whitespace-pre-line text-slate-700 pl-4">
                  {essayData.step9.bibliography}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <div className="flex items-center space-x-4">
              {essayData?.step3?.readings && essayData.step3.readings.length > 0 && (
                <div className="flex items-center text-sm text-slate-500">
                  <BookCheck className="h-4 w-4 mr-1" />
                  <span>{essayData.step3.readings.length} Sources</span>
                </div>
              )}
              {hasParagraphs && (
                <div className="flex items-center text-sm text-slate-500">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>
                    {paragraphs.reduce((acc, paragraph) => acc + paragraph.split(' ').length, 0)} Words
                  </span>
                </div>
              )}
              {hasParagraphs && (
                <div className="flex items-center text-sm text-slate-500">
                  <PenLine className="h-4 w-4 mr-1" />
                  <span>{paragraphs.length} Paragraphs</span>
                </div>
              )}
            </div>
            <Button 
              onClick={handleContinueEditing} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue Editing
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default View;
