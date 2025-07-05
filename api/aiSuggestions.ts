
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

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

    const modelName = 'gemini-1.5-flash';
    console.log(`Calling Gemini API with model: ${modelName} for type: ${type}`);

    let prompt = '';
    
    if (type === 'analysis' || type === 'analysis_with_highlights') {
      prompt = `You are a critical essay analysis expert. Analyze the following essay and provide honest, detailed feedback. The essay may have significant issues - be thorough and constructive in your criticism.

You MUST respond with ONLY a valid JSON object - no other text before or after. The JSON must have these exact keys:

{
  "overallScore": (integer 0-100, be honest - most student essays should score 40-70),
  "clarityScore": (integer 0-100, judge based on actual writing quality), 
  "clarityComment": "(one detailed sentence about specific clarity issues)",
  "consistencyScore": (integer 0-100, look for logical flow and argument consistency),
  "consistencyComment": "(one detailed sentence about specific consistency issues)",
  "logicalFallacies": [{"fallacyName": "Name of fallacy", "offendingSentence": "exact sentence from essay"}],
  "highlights": [{"sentence": "exact sentence from essay", "feedback": "specific, actionable improvement suggestion", "type": "error|warning|suggestion"}]
}

For scoring:
- 90-100: Exceptional, publication-quality writing
- 80-89: Very good, minor issues
- 70-79: Good, some notable issues
- 60-69: Adequate, several issues
- 50-59: Poor, major issues
- Below 50: Very poor, fundamental problems

For highlights, focus on the 5-8 most important issues. Use:
- "error" for serious problems (grammar, logic, factual errors)
- "warning" for moderate issues (unclear phrasing, weak arguments)
- "suggestion" for improvements (style, word choice, structure)

Be specific and constructive in your feedback. Point out actual problems, not generic praise.

Essay to analyze:
---
${sentence}
---

Respond with ONLY the JSON object:`;
    } else {
      prompt = `You are an expert writing coach. Analyze the following text and provide one specific, actionable suggestion for improvement. Focus on the most important issue: clarity, conciseness, stronger arguments, or better word choice. Be constructive and specific. Text: '${sentence}'`;
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      
      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: { 
          temperature: type === 'analysis' || type === 'analysis_with_highlights' ? 0.2 : 0.7,
          maxOutputTokens: type === 'analysis' || type === 'analysis_with_highlights' ? 3000 : 300
        }
      };

      console.log('Sending request to Gemini...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
