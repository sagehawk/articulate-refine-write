
import { StepLayout } from "@/components/layout/StepLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Step7 = () => {
  return (
    <StepLayout step={7} totalSteps={9}>
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Paragraph Reordering
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Paragraph Reordering</CardTitle>
          <CardDescription>
            Optimize the flow of your essay by reordering paragraphs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            This step will be implemented in the next phase. Here you will be able to reorder paragraphs 
            using drag-and-drop functionality to improve the overall flow of your essay.
          </p>
        </CardContent>
      </Card>
    </StepLayout>
  );
};

export default Step7;
