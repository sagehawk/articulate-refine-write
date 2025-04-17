
import { StepLayout } from "@/components/layout/StepLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Step8 = () => {
  return (
    <StepLayout step={8} totalSteps={9}>
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Generate New Outline & Restructure
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Outline & Restructure</CardTitle>
          <CardDescription>
            Create a revised outline and reorganize your content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            This step will be implemented in the next phase. Here you will create a new outline from memory, 
            then restructure your draft based on this improved outline.
          </p>
        </CardContent>
      </Card>
    </StepLayout>
  );
};

export default Step8;
