
import { StepLayout } from "@/components/layout/StepLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Step6 = () => {
  return (
    <StepLayout step={6} totalSteps={9}>
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Sentence Editing & Refinement
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Sentence Editing & Refinement</CardTitle>
          <CardDescription>
            Polish your writing at the sentence level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            This step will be implemented in the next phase of development. Here you will refine your sentences for 
            clarity, conciseness, and impact, with optional AI assistance to suggest improvements.
          </p>
        </CardContent>
      </Card>
    </StepLayout>
  );
};

export default Step6;
