
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Essay } from "@/types/essay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteEssay, setActiveEssay } from "@/utils/localStorage";
import { FileText, Trash2, Clock, CheckCircle, ArrowRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EssayListProps {
  essays: Essay[];
  title: string;
  icon: "draft" | "completed";
  onEssayDeleted: () => void;
}

export function EssayList({ essays, title, icon, onEssayDeleted }: EssayListProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [essayToDelete, setEssayToDelete] = useState<Essay | null>(null);

  if (essays.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-nunito font-bold text-slate-800">{title}</h2>
          {icon === "draft" ? (
            <Clock className="ml-2 h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircle className="ml-2 h-5 w-5 text-emerald-500" />
          )}
        </div>
        <Card>
          <CardContent className="pt-6 text-center text-slate-500">
            No essays found
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleContinueEssay = (essay: Essay) => {
    setActiveEssay(essay.id);
    navigate(`/step${essay.currentStep}`);
  };

  const confirmDeleteEssay = (essay: Essay) => {
    setEssayToDelete(essay);
    setDeleteDialogOpen(true);
  };

  const handleDeleteEssay = () => {
    if (essayToDelete) {
      deleteEssay(essayToDelete.id);
      setDeleteDialogOpen(false);
      setEssayToDelete(null);
      onEssayDeleted();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-nunito font-bold text-slate-800">{title}</h2>
        {icon === "draft" ? (
          <Clock className="ml-2 h-5 w-5 text-amber-500" />
        ) : (
          <CheckCircle className="ml-2 h-5 w-5 text-emerald-500" />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {essays.map((essay) => (
          <Card key={essay.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-start justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="text-lg font-inter font-medium truncate">{essay.title}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col text-sm text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Last updated:</span>
                  <span>{formatDate(essay.lastUpdatedAt)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Status:</span>
                  <span className="font-medium">
                    {essay.isCompleted ? (
                      <span className="text-emerald-500">Completed</span>
                    ) : (
                      <span className="text-amber-500">Step {essay.currentStep}/9</span>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => confirmDeleteEssay(essay)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                onClick={() => handleContinueEssay(essay)}
                size="sm"
                className="space-x-1 bg-blue-600 hover:bg-blue-700"
              >
                <span>{essay.isCompleted ? "View" : "Continue"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{essayToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEssay} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
