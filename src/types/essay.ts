
export interface Essay {
  id: string;
  title: string;
  currentStep: number;
  createdAt: number;
  lastUpdatedAt: number;
  isCompleted: boolean;
}

export interface Step1Data {
  goal: string;
  workspace: string;
  timeManagement: string;
}

export interface Step2Data {
  // Primarily for UI state like accordion open/closed states
  openAccordions: string[];
}

export interface Step3Data {
  topics: string[];
  readings: ReadingItem[];
  notes?: string; // Added custom notes field
}

export interface ReadingItem {
  title: string;
  notes: string;
}

export interface Step4Data {
  outlineSentences: string[];
}

export interface Step5Data {
  paragraphs: string[];
}

export interface Step6Data {
  // This step modifies the paragraphs from Step 5
  // We can track edits if needed for history
  editHistory?: {
    paragraphIndex: number;
    originalSentence: string;
    newSentence: string;
    timestamp: number;
  }[];
}

export interface Step7Data {
  // This step reorders paragraphs from Step 5/6
  // The order array stores indices from the original paragraph array
  paragraphOrder: number[];
}

export interface Step8Data {
  newOutlineSentences: string[];
  newParagraphs: string[];
  editHistory?: {
    paragraphIndex: number;
    originalSentence: string;
    newSentence: string;
    timestamp: number;
  }[];
}

export interface Step9Data {
  bibliography: string;
  formattingChecks: {
    doubleSpaced: boolean;
    titlePage: boolean;
    citationsChecked: boolean;
  };
}

export interface Topic {
  id: string;
  title: string;
  order: number;
}

export interface Paragraph {
  id: string;
  topicId: string;
  content: string;
  order: number;
}

export interface EssayData {
  essay: Essay;
  topics: { [key: string]: Topic };
  paragraphs: { [key: string]: Paragraph };
  // ... (rest of the interface)
}
