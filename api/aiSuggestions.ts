
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
    console.log(`Calling Gemini API with model: ${modelName}`);

    let prompt = '';
    
    if (type === 'analysis') {
      prompt = `Analyze the following essay for clarity, logical consistency, and logical fallacies. Provide your response ONLY in a valid JSON format. The JSON object must have these exact keys and data types:
- "overallScore": An integer score from 0 to 100 representing the overall quality of the argument.
- "clarityScore": An integer score from 0 to 100 for clarity and conciseness.
- "clarityComment": A one-sentence comment on clarity.
- "consistencyScore": An integer score from 0 to 100 for logical consistency.
- "consistencyComment": A one-sentence comment on consistency.
- "logicalFallacies": An array of objects, where each object represents a detected fallacy and has two keys: "fallacyName" (e.g., "Hasty Generalization") and "offendingSentence" (the exact sentence from the essay where it was found). If no fallacies are found, this must be an empty array.

Essay Text:
---
${sentence}`;
    } else {
      prompt = `You are an expert writing coach. Analyze the following text and provide one single, concise suggestion for improvement. Text: '${sentence}'`;
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
          temperature: 0.7,
          maxOutputTokens: type === 'analysis' ? 1000 : 200
        }
      };

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

      const responseText = data.candidates[0].content.parts[0].text;
      
      if (type === 'analysis') {
        // For analysis, return the raw JSON response
        return res.status(200).json({ suggestions: [responseText] });
      } else {
        // For coaching, return the suggestion as is
        return res.status(200).json({ suggestions: [responseText] });
      }

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
