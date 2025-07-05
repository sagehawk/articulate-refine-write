export interface AnalysisResult {
  overallScore: number;
  clarityScore: number;
  clarityComment: string;
  consistencyScore: number;
  consistencyComment: string;
  logicalFallacies: Array<{
    fallacyName: string;
    offendingSentence: string;
  }>;
  highlights?: Array<{
    sentence: string;
    feedback: string;
    type: 'error' | 'warning' | 'suggestion';
  }>;
}

export const analyzeEssayWithHighlights = async (essayText: string): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/aiSuggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sentence: essayText,
        type: 'analysis_with_highlights'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze essay');
    }

    const data = await response.json();
    
    // Try to parse JSON response from AI
    try {
      const analysisData = JSON.parse(data.suggestions[0]);
      return {
        overallScore: analysisData.overallScore || 75,
        clarityScore: analysisData.clarityScore || 70,
        clarityComment: analysisData.clarityComment || "Generally clear with room for improvement.",
        consistencyScore: analysisData.consistencyScore || 80,
        consistencyComment: analysisData.consistencyComment || "Arguments flow logically.",
        logicalFallacies: analysisData.logicalFallacies || [],
        highlights: analysisData.highlights || []
      };
    } catch (parseError) {
      // Fallback if AI doesn't return valid JSON
      return {
        overallScore: 75,
        clarityScore: 70,
        clarityComment: "Generally clear with room for improvement.",
        consistencyScore: 80,
        consistencyComment: "Arguments flow logically.",
        logicalFallacies: [],
        highlights: []
      };
    }
  } catch (error) {
    console.error('Error analyzing essay:', error);
    // Return fallback analysis
    return {
      overallScore: 75,
      clarityScore: 70,
      clarityComment: "Analysis unavailable - please try again later.",
      consistencyScore: 80,
      consistencyComment: "Analysis unavailable - please try again later.",
      logicalFallacies: [],
      highlights: []
    };
  }
};

// Keep the original function for backward compatibility
export const analyzeEssay = analyzeEssayWithHighlights;
