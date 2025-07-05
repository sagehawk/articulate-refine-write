
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
    console.log('Starting essay analysis...');
    
    // Clean up the essay text to avoid double counting
    const cleanText = essayText.trim();
    const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
    console.log(`Analyzing essay with ${wordCount} words`);
    
    const response = await fetch('/api/aiSuggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sentence: cleanText,
        type: 'analysis_with_highlights'
      }),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response not ok:', response.status, errorText);
      throw new Error(`Failed to analyze essay: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    if (data.suggestions && data.suggestions.length > 0) {
      const aiResponse = data.suggestions[0];
      console.log('Raw AI response:', aiResponse);
      
      try {
        // Clean the response to remove any markdown formatting
        const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        const analysisData = JSON.parse(cleanResponse);
        console.log('Parsed analysis data:', analysisData);
        
        // Validate the response has required fields
        if (!analysisData.overallScore || !analysisData.clarityScore || !analysisData.consistencyScore) {
          throw new Error('Invalid analysis response structure');
        }
        
        return {
          overallScore: Math.max(0, Math.min(100, analysisData.overallScore)),
          clarityScore: Math.max(0, Math.min(100, analysisData.clarityScore)),
          clarityComment: analysisData.clarityComment || "Analysis completed.",
          consistencyScore: Math.max(0, Math.min(100, analysisData.consistencyScore)),
          consistencyComment: analysisData.consistencyComment || "Analysis completed.",
          logicalFallacies: Array.isArray(analysisData.logicalFallacies) ? analysisData.logicalFallacies : [],
          highlights: Array.isArray(analysisData.highlights) ? analysisData.highlights : []
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('Raw response was:', aiResponse);
        
        // Return a realistic fallback for poor essays
        return {
          overallScore: 45,
          clarityScore: 40,
          clarityComment: "Unable to complete detailed analysis. Please check your essay for basic writing issues.",
          consistencyScore: 50,
          consistencyComment: "Unable to complete detailed analysis. Please review argument structure.",
          logicalFallacies: [],
          highlights: [{
            sentence: cleanText.split('.')[0] + '.',
            feedback: "This essay needs significant improvement in clarity and structure.",
            type: 'error' as const
          }]
        };
      }
    } else {
      console.warn('No suggestions in API response');
      throw new Error('No analysis suggestions returned');
    }
  } catch (error) {
    console.error('Error analyzing essay:', error);
    
    // Return a realistic fallback analysis indicating the essay likely has issues
    return {
      overallScore: 35,
      clarityScore: 30,
      clarityComment: "Analysis failed - this often indicates significant writing issues that need attention.",
      consistencyScore: 40,
      consistencyComment: "Analysis failed - please review your essay structure and logic.",
      logicalFallacies: [],
      highlights: [{
        sentence: "Analysis could not be completed",
        feedback: "Technical analysis failed. Please review your essay for basic grammar, structure, and clarity issues.",
        type: 'error' as const
      }]
    };
  }
};

export const analyzeEssay = analyzeEssayWithHighlights;
