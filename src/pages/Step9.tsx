
import { StepLayout } from "@/components/layout/StepLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Step9 = () => {
  return (
    <StepLayout step={9} totalSteps={9}>
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        References & Formatting
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>References & Formatting</CardTitle>
          <CardDescription>
            Add citations and format your essay for submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            This step will be implemented in the next phase. Here you will add your bibliography, 
            check formatting, and prepare your essay for final submission.
          </p>
        </CardContent>
      </Card>
    </StepLayout>
  );
};

export default Step9;
