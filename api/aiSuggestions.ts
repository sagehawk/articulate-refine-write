
// api/aiSuggestions.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is the environment variable you set in Vercel's dashboard
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Always set Content-Type header for JSON
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
      prompt = `Analyze the following essay for clarity, logical consistency, and logical fallacies. You MUST respond with ONLY a valid JSON object - no other text before or after. The JSON must have these exact keys:

{
  "overallScore": (integer 0-100),
  "clarityScore": (integer 0-100), 
  "clarityComment": "(one sentence about clarity)",
  "consistencyScore": (integer 0-100),
  "consistencyComment": "(one sentence about consistency)",
  "logicalFallacies": [{"fallacyName": "Name of fallacy", "offendingSentence": "exact sentence from essay"}],
  "highlights": [{"sentence": "exact sentence from essay", "feedback": "specific improvement suggestion", "type": "error|warning|suggestion"}]
}

For highlights, focus on the 3-5 most important issues. Use "error" for serious problems, "warning" for moderate issues, "suggestion" for improvements.

Essay to analyze:
---
${sentence}
---

Respond with ONLY the JSON object:`;
    } else {
      prompt = `You are an expert writing coach. Analyze the following text and provide one single, concise suggestion for improvement. Focus on clarity, conciseness, and stronger arguments. Text: '${sentence}'`;
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
          temperature: type === 'analysis' || type === 'analysis_with_highlights' ? 0.3 : 0.7,
          maxOutputTokens: type === 'analysis' || type === 'analysis_with_highlights' ? 2000 : 300
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
