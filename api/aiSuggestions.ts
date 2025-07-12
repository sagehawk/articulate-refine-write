
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, X-goog-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('API function called with body:', req.body);
    const { sentence, type } = req.body;

    if (!sentence) {
      return res.status(400).json({
        message: 'Missing sentence parameter',
        suggestions: []
      });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable not set.');
      return res.status(500).json({
        message: 'Server configuration error - missing API key',
        suggestions: []
      });
    }

    console.log(`Calling Gemini API for type: ${type}`);

    let prompt = '';
    
    if (type === 'analysis' || type === 'analysis_with_highlights') {
      prompt = `You are a helpful and constructive writing assistant for beginner writers. Your goal is to help users develop structured, logical, and clear essays. Analyze the provided essay with a focus on logic, clarity, and structure. Avoid subjective opinions and maintain an encouraging and educational tone.

You MUST respond with ONLY a valid JSON object - no other text before or after. The JSON must have these exact keys:

{
  "overallScore": (integer 0-100, based on the rubric below),
  "clarityScore": (integer 0-100, how clear and easy to understand is the writing?),
  "clarityComment": "(one constructive sentence about how to improve clarity)",
  "consistencyScore": (integer 0-100, does the essay maintain a consistent argument and flow?),
  "consistencyComment": "(one constructive sentence about improving consistency)",
  "logicalFallacies": [{"fallacyName": "Name of fallacy", "offendingSentence": "exact sentence from essay"}],
  "highlights": [{"sentence": "exact sentence from essay", "feedback": "constructive, specific feedback", "type": "error|warning|suggestion"}]
}

SCORING GUIDELINES (Be encouraging and constructive):
- 90-100: Excellent. The argument is clear, logical, and well-supported.
- 80-89: Very Good. A solid argument with minor room for improvement in clarity or structure.
- 70-79: Good. The main ideas are present, but could be better organized or more clearly expressed.
- 60-69: Fair. The essay has a basic structure, but contains some inconsistencies or unclear points.
- 50-59: Needs Improvement. The essay shows potential but requires significant work on structure and clarity.
- Below 50: Foundational Issues. The essay has significant logical or structural problems that need to be addressed.

For highlights, focus on providing helpful feedback:
- "error" for significant logical fallacies or contradictions.
- "warning" for unclear phrasing or weak connections between ideas.
- "suggestion" for ways to improve sentence structure, word choice, and overall flow.

Your feedback should be objective and focused on helping the user build a stronger, more logical argument. Identify logical fallacies and areas where the structure could be improved.

Look for:
- Logical fallacies (e.g., ad hominem, straw man, etc.)
- Inconsistent arguments or contradictions.
- Sentences or paragraphs that are unclear or confusing.
- Opportunities to improve the logical flow and structure.
- Lack of supporting evidence for claims.

Essay to analyze:
---
${sentence}
---

Respond with ONLY the JSON object:`;
    } else if (type === 'coach') {
      prompt = `You are an expert writing coach. The user has selected this text from their essay paragraph:

"${sentence}"

Provide one specific, actionable suggestion to improve this text. Focus on the most important issue: clarity, conciseness, stronger arguments, better word choice, grammar, or logical flow. Be constructive and specific. Give practical advice they can immediately apply.

Keep your response to 1-2 sentences and be encouraging while being helpful.`;
    } else {
      prompt = `You are an expert writing coach. Analyze the following text and provide one specific, actionable suggestion for improvement. Focus on the most important issue: clarity, conciseness, stronger arguments, or better word choice. Be constructive and specific. Text: '${sentence}'`;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      console.log('Sending request to Gemini...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Gemini API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API response not OK:', response.status, errorText);
        return res.status(response.status).json({
          message: `Gemini API error: ${response.status}`,
          error: errorText,
          suggestions: []
        });
      }

      const data = await response.json();

      if (data.error) {
        console.error('Gemini API returned error object:', data.error);
        return res.status(500).json({
          message: 'Gemini API error',
          error: data.error,
          suggestions: []
        });
      }

      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Gemini response missing expected structure:', data);
        return res.status(500).json({
          message: 'Gemini API did not return expected content structure.',
          error: data,
          suggestions: []
        });
      }

      const responseText = data.candidates[0].content.parts[0].text.trim();
      console.log('Gemini response text:', responseText);

      return res.status(200).json({ suggestions: [responseText] });

    } catch (fetchError) {
      console.error('Error calling Gemini API:', fetchError);
      return res.status(500).json({
        message: 'Error calling Gemini API',
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        suggestions: []
      });
    }

  } catch (error) {
    console.error('Error in API function handler:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
      suggestions: []
    });
  }
}
