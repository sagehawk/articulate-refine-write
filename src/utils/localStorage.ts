
import { Essay, EssayData } from "@/types/essay";

const ESSAY_PREFIX = "essay_";
const ACTIVE_ESSAY_KEY = "activeEssayId";

// Get all essays from localStorage
export const getAllEssays = (): Essay[] => {
  const essays: Essay[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(ESSAY_PREFIX)) {
      try {
        const essayData = JSON.parse(localStorage.getItem(key) || "");
        if (essayData.essay) {
          essays.push(essayData.essay);
        }
      } catch (error) {
        console.error("Error parsing essay data:", error);
      }
    }
  }
  
  // Sort by last updated, most recent first
  return essays.sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
};

// Get a specific essay's data
export const getEssayData = (essayId: string): EssayData | null => {
  const key = `${ESSAY_PREFIX}${essayId}`;
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as EssayData;
  } catch (error) {
    console.error(`Error retrieving essay ${essayId}:`, error);
    return null;
  }
};

// Save essay data
export const saveEssayData = (essayData: EssayData): void => {
  const { essay } = essayData;
  const key = `${ESSAY_PREFIX}${essay.id}`;
  
  // Update the lastUpdatedAt timestamp
  essayData.essay.lastUpdatedAt = Date.now();
  
  try {
    localStorage.setItem(key, JSON.stringify(essayData));
  } catch (error) {
    console.error(`Error saving essay ${essay.id}:`, error);
    throw new Error("Failed to save essay data");
  }
};

// Create a new essay
export const createNewEssay = (title: string): EssayData => {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();
  
  const essay: Essay = {
    id,
    title,
    currentStep: 1,
    createdAt: now,
    lastUpdatedAt: now,
    isCompleted: false
  };
  
  const essayData: EssayData = { 
    essay,
    topics: [],
    sentences: {},
    paragraphs: {},
    refinedSentences: {},
    reorderedParagraphs: [],
    bibliography: ""
  };
  
  saveEssayData(essayData);
  setActiveEssay(id);
  
  return essayData;
};

// Delete an essay
export const deleteEssay = (essayId: string): void => {
  const key = `${ESSAY_PREFIX}${essayId}`;
  
  try {
    localStorage.removeItem(key);
    
    // If this was the active essay, clear the active essay
    if (getActiveEssay() === essayId) {
      clearActiveEssay();
    }
  } catch (error) {
    console.error(`Error deleting essay ${essayId}:`, error);
  }
};

// Set the active essay
export const setActiveEssay = (essayId: string): void => {
  localStorage.setItem(ACTIVE_ESSAY_KEY, essayId);
};

// Get the active essay ID
export const getActiveEssay = (): string | null => {
  return localStorage.getItem(ACTIVE_ESSAY_KEY);
};

// Clear the active essay
export const clearActiveEssay = (): void => {
  localStorage.removeItem(ACTIVE_ESSAY_KEY);
};

// Update essay step
export const updateEssayStep = (essayId: string, step: number): void => {
  const essayData = getEssayData(essayId);
  if (!essayData) return;
  
  essayData.essay.currentStep = step;
  saveEssayData(essayData);
};

// Mark essay as complete
export const completeEssay = (essayId: string): void => {
  const essayData = getEssayData(essayId);
  if (!essayData) return;
  
  essayData.essay.isCompleted = true;
  saveEssayData(essayData);
};
