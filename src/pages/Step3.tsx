
import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, ReadingItem, Step3Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, BookOpen } from "lucide-react";

const Step3 = () => {
  const [topics, setTopics] = useState<string[]>(Array(10).fill(""));
  const [readings, setReadings] = useState<ReadingItem[]>([{ title: "", notes: "" }]);
  const [essayData, setEssayData] = useState<EssayData | null>(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        if (data.step3) {
          if (data.step3.topics) {
            // Fill the existing topics and pad with empty strings to reach 10
            const existingTopics = [...data.step3.topics];
            while (existingTopics.length < 10) {
              existingTopics.push("");
            }
            setTopics(existingTopics);
          }
          
          if (data.step3.readings && data.step3.readings.length > 0) {
            setReadings(data.step3.readings);
          }
        }
      }
    }
  }, []);

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleReadingTitleChange = (index: number, value: string) => {
    const newReadings = [...readings];
    newReadings[index] = { ...newReadings[index], title: value };
    setReadings(newReadings);
  };

  const handleReadingNotesChange = (index: number, value: string) => {
    const newReadings = [...readings];
    newReadings[index] = { ...newReadings[index], notes: value };
    setReadings(newReadings);
  };

  const addReading = () => {
    setReadings([...readings, { title: "", notes: "" }]);
  };

  const removeReading = (index: number) => {
    if (readings.length > 1) {
      const newReadings = [...readings];
      newReadings.splice(index, 1);
      setReadings(newReadings);
    }
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      // Filter out empty topics
      const filteredTopics = topics.filter(topic => topic.trim() !== "");
      
      // Filter out readings with empty titles
      const filteredReadings = readings.filter(reading => reading.title.trim() !== "");
      
      data.step3 = {
        topics: filteredTopics,
        readings: filteredReadings
      };
      
      saveEssayData(data);
    }
  };

  return (
    <StepLayout 
      step={3} 
      totalSteps={9}
      onSave={handleSave}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Topic Questions & Reading List
      </h2>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Topic Questions</CardTitle>
            <CardDescription>
              Brainstorm potential questions to explore in your essay.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              List potential topics or questions that you're interested in exploring. These will help
              focus your reading and research.
            </p>
            
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-slate-500 font-medium w-6">{index + 1}.</span>
                  <Input
                    value={topic}
                    onChange={(e) => handleTopicChange(index, e.target.value)}
                    placeholder="Enter a potential topic question"
                    className="ml-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Reading List</span>
              <Button 
                onClick={addReading} 
                variant="outline"
                size="sm"
                className="space-x-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Reading</span>
              </Button>
            </CardTitle>
            <CardDescription>
              Compile sources and take notes in your own words.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Add sources you plan to read or have read. For each source, take notes in your own words.
              Peterson emphasizes that active note-taking in your own language increases comprehension and retention.
            </p>
            
            <div className="space-y-6">
              {readings.map((reading, index) => (
                <div key={index} className="border rounded-md p-4 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">Source {index + 1}</span>
                    </div>
                    
                    {readings.length > 1 && (
                      <Button
                        onClick={() => removeReading(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`reading-title-${index}`}>Title/Source</Label>
                      <Input
                        id={`reading-title-${index}`}
                        value={reading.title}
                        onChange={(e) => handleReadingTitleChange(index, e.target.value)}
                        placeholder="Book title, article, website, etc."
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`reading-notes-${index}`}>Notes (in your own words)</Label>
                      <Textarea
                        id={`reading-notes-${index}`}
                        value={reading.notes}
                        onChange={(e) => handleReadingNotesChange(index, e.target.value)}
                        placeholder="Write notes in your own words to improve understanding and retention."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={addReading} 
                variant="outline"
                className="space-x-1"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Another Reading</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
};

export default Step3;
