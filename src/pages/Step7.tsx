import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate if needed for error handling/navigation
import { StepLayout } from "@/components/layout/StepLayout";
import { EssayData } from "@/types/essay";
import { getActiveEssay, getEssayData, saveEssayData } from "@/utils/localStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Import Button if you add other actions, not strictly needed for just reordering/saving via StepLayout
// import { Button } from "@/components/ui/button";
import { GripVertical } from 'lucide-react'; // Icon for drag handle
import { toast } from "sonner";

const Step7 = () => {
  const [essayData, setEssayData] = useState<EssayData | null>(null);
  // Local state specifically for managing the order of paragraphs in this step
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate for potential redirects

  // Refs for managing drag-and-drop state without causing re-renders
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);

  // Load essay data on component mount
  useEffect(() => {
    setIsLoading(true); // Start loading
    const activeEssayId = getActiveEssay();
    if (activeEssayId) {
      const data = getEssayData(activeEssayId);
      if (data) {
        setEssayData(data);
        // Initialize the local paragraphs state from the loaded data
        // *** IMPORTANT: Ensure paragraphs are stored in data.step5.paragraphs ***
        // If stored elsewhere (e.g., data.step6?), update this line.
        setParagraphs(data.step5?.paragraphs || []);
      } else {
        toast.error("Failed to load essay data for Step 7.");
        // Optional: Redirect if data load fails
        // navigate('/');
      }
    } else {
      toast.error("No active essay selected.");
      // Optional: Redirect if no essay is active
      // navigate('/');
    }
    setIsLoading(false); // Finish loading
  }, [navigate]); // Include navigate in dependency array

  // --- Drag and Drop Handlers wrapped in useCallback ---

  const handleDragStart = useCallback((index: number) => {
    // console.log(`Dragging started: item ${index}`);
    dragItemIndex.current = index;
    // You could add event.dataTransfer logic here if needed, but not required for basic reordering
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    // console.log(`Dragging entered: item ${index}`);
    dragOverItemIndex.current = index;
    // Add visual cue styling if needed, the CSS classes handle basic cases
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // This is necessary to allow dropping
  }, []);

  const handleDrop = useCallback(() => {
    // console.log(`Drop occurred`);
    // Check if indices are valid and different
    if (
      dragItemIndex.current === null ||
      dragOverItemIndex.current === null ||
      dragItemIndex.current === dragOverItemIndex.current
    ) {
        // console.log("Invalid drop condition, resetting.");
        // Reset refs and potentially force a re-render to clear styles if needed
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;
        setParagraphs((prev) => [...prev]); // Trigger re-render to clear styles
        return;
    }

    // console.log(`Moving item from index ${dragItemIndex.current} to index ${dragOverItemIndex.current}`);

    // Perform the reorder
    const currentDragIndex = dragItemIndex.current;
    const currentOverIndex = dragOverItemIndex.current;

    setParagraphs((prevParagraphs) => {
        const reorderedParagraphs = [...prevParagraphs];
        const [draggedItem] = reorderedParagraphs.splice(currentDragIndex, 1);
        reorderedParagraphs.splice(currentOverIndex, 0, draggedItem);
        return reorderedParagraphs;
    });

    // Reset refs after state update is queued
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;

    // Note: We don't update essayData state directly here anymore.
    // handleSave will use the latest 'paragraphs' state when called by StepLayout.
    // This prevents potential state inconsistencies if save happens between drop and state update.

  }, []); // No direct state dependencies here, uses refs and setParagraphs updater

  const handleDragEnd = useCallback(() => {
    // console.log("Dragging ended");
    // Reset refs in case drop didn't occur on a valid target
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
    // Force a re-render to clear any dangling styles (like opacity)
    setParagraphs((prev) => [...prev]);
  }, []);


  // --- Saving ---
  // This function is passed to StepLayout and called when its save mechanism is triggered
  const handleSave = useCallback((currentEssayData: EssayData | null) => {
    // console.log("handleSave called in Step 7");
    if (!currentEssayData) {
      toast.error("Cannot save, essay data is missing.");
      return;
    }
    // Create a copy of the data to save
    const dataToSave: EssayData = {
      ...currentEssayData,
      // *** IMPORTANT: Ensure paragraphs are saved back to data.step5.paragraphs ***
      // If they originated from elsewhere (e.g., data.step6?), update this target path.
      step5: {
        ...(currentEssayData.step5 || {}), // Preserve other potential step5 data
        paragraphs: paragraphs, // Use the latest order from the local 'paragraphs' state
      }
      // You could add specific Step 7 data here if needed:
      // step7: {
      //   lastReordered: new Date().toISOString(),
      // }
    };

    saveEssayData(dataToSave);
    toast.info("Paragraph order saved."); // Provide feedback

    // Also update the main essayData state to reflect the saved state
    setEssayData(dataToSave);

  }, [paragraphs]); // Dependency: 'paragraphs' state is crucial for saving the correct order


  // --- Conditional Rendering ---

  if (isLoading) {
    // Consistent loading state within StepLayout
    return (
      <StepLayout step={7} totalSteps={9} isLoading={true}>
        <p>Loading Step 7...</p>
      </StepLayout>
    );
  }

  if (!essayData) {
    // Consistent error state within StepLayout
    return (
      <StepLayout step={7} totalSteps={9}>
        <p className="text-red-600">Error: Could not load essay data. Please go back and select an essay.</p>
      </StepLayout>
    );
  }

  // Determine if the user can proceed (e.g., if paragraphs exist to be ordered)
  // Adjust this logic if needed for Step 7 requirements
  const canProceed = paragraphs.length > 0;

  return (
    <StepLayout
      step={7}
      totalSteps={9}
      // Pass the handleSave function, StepLayout will provide the current essayData
      onSave={() => handleSave(essayData)}
      canProceed={canProceed}
      // Add any other props needed by StepLayout (e.g., disablePreviousSteps)
    >
      {/* Page Title */}
      <h2 className="text-2xl font-nunito font-bold text-slate-800 mb-6">
        Step 7: Refine Paragraph Order
      </h2>

      {/* Main Content Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Arrange Your Paragraphs</CardTitle>
          <CardDescription>
            Drag and drop the paragraphs using the handle <GripVertical className="inline h-4 w-4 align-middle" /> to arrange them in the most logical and effective order for your essay's flow. The order will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paragraphs.length === 0 ? (
            <p className="text-slate-500 text-center py-6 px-4 border border-dashed border-slate-300 rounded-md">
              No paragraphs found for this essay. Please ensure paragraphs were generated in previous steps (like Step 5).
            </p>
          ) : (
            <div className="space-y-3"> {/* Reduced spacing slightly */}
              {paragraphs.map((paragraph, index) => (
                <div
                  key={`paragraph-${index}`} // Using index is generally okay for stable lists during reorder
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className={`border rounded-lg bg-white shadow-sm cursor-grab transition-all duration-150 ease-in-out flex items-start gap-3 group relative
                     ${dragItemIndex.current === index ? 'opacity-40 border-blue-500 ring-2 ring-blue-300 shadow-xl z-10' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}
                     ${dragOverItemIndex.current === index && dragItemIndex.current !== null && dragItemIndex.current !== index ? '!border-blue-600 border-dashed ring-2 ring-blue-300 ring-offset-1 scale-[1.01] bg-blue-50/30 z-0' : ''}
                  `}
                  title={`Paragraph ${index + 1}. Drag to reorder.`}
                >
                  {/* Drag Handle */}
                  <div className="p-3 border-r border-slate-200 flex-shrink-0 self-stretch flex items-center bg-slate-50 rounded-l-lg group-hover:bg-slate-100">
                     <GripVertical className="h-5 w-5 text-slate-400 group-hover:text-slate-600" aria-hidden="true" />
                  </div>
                  {/* Paragraph Content */}
                  <p className="text-slate-700 whitespace-pre-wrap flex-grow py-3 pr-3 text-sm sm:text-base leading-relaxed">
                     {paragraph}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* You can add other elements specific to Step 7 here if needed */}
      {/* e.g., buttons for additional actions, tips, etc. */}

    </StepLayout>
  );
};

export default Step7;