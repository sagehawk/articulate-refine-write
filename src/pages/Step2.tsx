
import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData, Step2Data } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Step2 = () => {
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [essayData, setEssayData] = useState<EssayData | null>(null);

  useEffect(() => {
    const activeEssayId = getActiveEssay();
    
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        
        if (data.step2?.openAccordions) {
          setOpenAccordions(data.step2.openAccordions);
        }
      }
    }
  }, []);

  const handleAccordionChange = (value: string) => {
    if (openAccordions.includes(value)) {
      setOpenAccordions(openAccordions.filter(item => item !== value));
    } else {
      setOpenAccordions([...openAccordions, value]);
    }
  };

  const handleSave = (data: EssayData) => {
    if (data) {
      data.step2 = {
        openAccordions
      };
      saveEssayData(data);
    }
  };

  return (
    <StepLayout 
      step={2} 
      totalSteps={9}
      onSave={handleSave}
    >
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Levels of Resolution
      </h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Understanding Resolution Levels in Writing</CardTitle>
          <CardDescription>
            Peterson emphasizes that good writing exists simultaneously at multiple levels of resolution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">
            Each element of your essay—from individual words to the essay as a whole—must work together 
            as part of a coherent, integrated structure. The quality of your essay is determined by how 
            well you manage each of these levels.
          </p>
          
          <p className="text-slate-600">
            Explore each level below to understand its significance in your writing process.
          </p>
        </CardContent>
      </Card>

      <Accordion 
        type="multiple" 
        value={openAccordions}
        onValueChange={(newValues) => {
          setOpenAccordions(newValues as string[]);
        }}
        className="space-y-4"
      >
        <AccordionItem value="word">
          <AccordionTrigger className="text-lg font-medium py-4 px-4 bg-slate-50 hover:bg-slate-100 rounded-md">
            Word Level
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2 pb-4">
            <div className="space-y-3">
              <p>
                Each word should be chosen with care. Consider these points:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use precise, specific words rather than vague, general ones.</li>
                <li>Avoid unnecessary jargon, but use technical terms when appropriate.</li>
                <li>Consider the connotations and implications of each word.</li>
                <li>Use a thesaurus when needed, but never use a word whose meaning you don't fully understand.</li>
                <li>Simplicity and clarity trump complexity and obscurity.</li>
              </ul>
              <p className="italic text-slate-600 border-l-4 border-blue-300 pl-4 py-1">
                "A simple word is not a simple thing."
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sentence">
          <AccordionTrigger className="text-lg font-medium py-4 px-4 bg-slate-50 hover:bg-slate-100 rounded-md">
            Sentence Level
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2 pb-4">
            <div className="space-y-3">
              <p>
                Sentences express complete thoughts and build the foundation of your argument:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Each sentence should express one clear, complete thought.</li>
                <li>Vary sentence length for rhythm, but favor shorter sentences over longer ones.</li>
                <li>Ensure logical connections between sentences.</li>
                <li>Check that each sentence serves a purpose in advancing your argument.</li>
                <li>Rewrite complex sentences until they become clear.</li>
              </ul>
              <p className="italic text-slate-600 border-l-4 border-blue-300 pl-4 py-1">
                "A sentence should be clear enough that your reader can understand it in one pass."
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="paragraph">
          <AccordionTrigger className="text-lg font-medium py-4 px-4 bg-slate-50 hover:bg-slate-100 rounded-md">
            Paragraph Level
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2 pb-4">
            <div className="space-y-3">
              <p>
                Paragraphs develop single ideas that support your overall argument:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Each paragraph should focus on one main idea.</li>
                <li>Aim for approximately 10 sentences or about 100 words per paragraph.</li>
                <li>Begin with a topic sentence that states the main idea.</li>
                <li>Develop the idea with supporting evidence, examples, and reasoning.</li>
                <li>Ensure a logical flow from one paragraph to the next.</li>
              </ul>
              <p className="italic text-slate-600 border-l-4 border-blue-300 pl-4 py-1">
                "A paragraph is a conceptual unit, not just a stylistic one."
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="essay">
          <AccordionTrigger className="text-lg font-medium py-4 px-4 bg-slate-50 hover:bg-slate-100 rounded-md">
            Essay Level
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2 pb-4">
            <div className="space-y-3">
              <p>
                The essay as a whole presents a coherent argument or narrative:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your essay should have a clear purpose that unifies all its parts.</li>
                <li>Structure your essay with a beginning, middle, and end.</li>
                <li>Ensure a logical progression of ideas throughout the essay.</li>
                <li>Check that each paragraph contributes meaningfully to your overall purpose.</li>
                <li>Conclude by synthesizing your ideas, not merely summarizing them.</li>
                <li>After writing, step back and evaluate the essay as a whole.</li>
              </ul>
              <p className="italic text-slate-600 border-l-4 border-blue-300 pl-4 py-1">
                "An essay is a sustained argument that develops a single thesis through interconnected paragraphs."
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="context">
          <AccordionTrigger className="text-lg font-medium py-4 px-4 bg-slate-50 hover:bg-slate-100 rounded-md">
            Contextual Level
          </AccordionTrigger>
          <AccordionContent className="px-4 pt-2 pb-4">
            <div className="space-y-3">
              <p>
                Your essay exists within a broader intellectual context:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Consider your essay's relationship to the broader field of knowledge.</li>
                <li>Acknowledge and respond to relevant arguments and perspectives.</li>
                <li>Understand your audience and adapt your writing accordingly.</li>
                <li>Recognize the historical and cultural context of your subject.</li>
                <li>Be aware of your own biases and assumptions.</li>
              </ul>
              <p className="italic text-slate-600 border-l-4 border-blue-300 pl-4 py-1">
                "No essay exists in isolation; it's always part of a larger conversation."
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </StepLayout>
  );
};

export default Step2;
