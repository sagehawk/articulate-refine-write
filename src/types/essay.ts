
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
}

export interface Step9Data {
  bibliography: string;
  formattingChecks: {
    doubleSpaced: boolean;
    titlePage: boolean;
    citationsChecked: boolean;
  };
}

export interface EssayData {
  essay: Essay;
  step1?: Step1Data;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
  step5?: Step5Data;
  step6?: Step6Data;
  step7?: Step7Data;
  step8?: Step8Data;
  step9?: Step9Data;
}
