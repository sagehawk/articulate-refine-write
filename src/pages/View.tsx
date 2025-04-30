
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getActiveEssay, getEssayData } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  const handleRefine = () => {
    navigate("/step8");
  };

  const returnHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Loading essay...</p>
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

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {!hasParagraphs && !error && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800">No Content Yet</AlertTitle>
            <AlertDescription className="text-amber-700">
              Your essay doesn't have any content yet. Start by creating an outline and writing paragraphs.
            </AlertDescription>
          </Alert>
        )}
      
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-nunito font-bold text-slate-800">
                {essayData?.essay.title || "Untitled Essay"}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button onClick={returnHome} variant="outline" className="border-slate-200">
                Return to Editor
              </Button>
              <Button onClick={handleRefine} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refine Essay
              </Button>
            </div>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            {hasParagraphs ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="mb-6 text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                No content available. Start by adding content in the editor.
              </div>
            )}
          </CardContent>
        </Card>

        {essayData?.step3?.readings && essayData.step3.readings.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>References</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {essayData.step3.readings.map((reading, index) => (
                  <li key={index} className="text-slate-700">
                    {reading.title}
                    {reading.notes && (
                      <p className="text-sm text-slate-500 mt-1">{reading.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {essayData?.step9?.bibliography && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Bibliography</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-slate-700">
                {essayData.step9.bibliography}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default View;
