
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
    console.log('Starting essay analysis with text:', essayText.substring(0, 100) + '...');
    
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

    console.log('API response status:', response.status);

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText);
      throw new Error(`Failed to analyze essay: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    // Try to parse JSON response from AI
    try {
      if (data.suggestions && data.suggestions.length > 0) {
        const aiResponse = data.suggestions[0];
        console.log('Raw AI response:', aiResponse);
        
        // Try to parse as JSON
        const analysisData = JSON.parse(aiResponse);
        console.log('Parsed analysis data:', analysisData);
        
        return {
          overallScore: analysisData.overallScore || 75,
          clarityScore: analysisData.clarityScore || 70,
          clarityComment: analysisData.clarityComment || "Generally clear with room for improvement.",
          consistencyScore: analysisData.consistencyScore || 80,
          consistencyComment: analysisData.consistencyComment || "Arguments flow logically.",
          logicalFallacies: analysisData.logicalFallacies || [],
          highlights: analysisData.highlights || []
        };
      } else {
        console.warn('No suggestions in API response');
        throw new Error('No analysis suggestions returned');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback if AI doesn't return valid JSON
      return {
        overallScore: 75,
        clarityScore: 70,
        clarityComment: "Analysis could not be completed. Please try again.",
        consistencyScore: 80,
        consistencyComment: "Analysis could not be completed. Please try again.",
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
      clarityComment: "Analysis unavailable - please check your connection and try again.",
      consistencyScore: 80,
      consistencyComment: "Analysis unavailable - please check your connection and try again.",
      logicalFallacies: [],
      highlights: []
    };
  }
};

// Keep the original function for backward compatibility
export const analyzeEssay = analyzeEssayWithHighlights;
