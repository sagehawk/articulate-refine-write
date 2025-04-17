
import { StepLayout } from "@/components/layout/StepLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Step5 = () => {
  return (
    <StepLayout step={5} totalSteps={9}>
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Paragraph Drafting
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Paragraph Drafting</CardTitle>
          <CardDescription>
            Expand each outline sentence into a full paragraph.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            This step will be implemented in the next phase of development. Here you will expand each of your 
            outline sentences from Step 4 into full paragraphs, following Peterson's 100-word/10-sentence guideline.
          </p>
        </CardContent>
      </Card>
    </StepLayout>
  );
};

export default Step5;
