
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getActiveEssay, getEssayData } from "@/utils/localStorage";
import { EssayData } from "@/types/essay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, RefreshCw } from "lucide-react";

const View = () => {
  const navigate = useNavigate();
  const [essayData, setEssayData] = useState<EssayData | null>(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
      }
    }
  }, []);

  const getParagraphs = () => {
    if (!essayData) return [];
    return essayData.step8?.newParagraphs || 
           essayData.step5?.paragraphs || 
           [];
  };

  const handleRefine = () => {
    navigate("/step8");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-nunito font-bold text-slate-800">
                {essayData?.essay.title || "Untitled Essay"}
              </CardTitle>
            </div>
            <Button onClick={handleRefine} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refine Essay
            </Button>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            {getParagraphs().map((paragraph, index) => (
              <p key={index} className="mb-6 text-slate-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
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
      </div>
    </div>
  );
};

export default View;
