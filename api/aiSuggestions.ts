// api/aiSuggestions.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is the environment variable you set in Vercel's dashboard
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Consider restricting this in production
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
    const { sentence } = req.body;

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

    // Use the Lite model as discussed
    const modelName = 'gemini-2.0-flash-lite';

    console.log(`Calling Gemini API with model: ${modelName}, sentence: "${sentence}"`);

    try {
      // Use the correct domain name and v1 endpoint - CORRECTED THIS LINE
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      console.log('Target URL:', url); // Log the full URL for debugging

      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{
            text: `Rewrite the sentence below in three distinct ways. Each rewrite must be clearer, more concise, and more engaging than the original. Keep the original meaning. Output only the three rewritten sentences, numbered 1 to 3, with no introduction or explanation.\nSentence: ${sentence}\n`
          }]
        }],
         // Consider adding generation configuration here if needed, e.g., temperature, topP
         // generationConfig: { temperature: 0.7 }
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

        // Attempt to parse JSON error if possible, otherwise return raw text
        try {
            const errorJson = JSON.parse(errorText);
             return res.status(response.status).json({
              message: `Gemini API error: ${response.status}`,
              error: errorJson,
              suggestions: []
            });
        } catch (parseError) {
             return res.status(response.status).json({
              message: `Gemini API error: ${response.status}`,
              error: errorText,
              suggestions: []
            });
        }
      }

      const data = await response.json();
      console.log('Gemini API response (partial):', JSON.stringify(data).substring(0, 500) + '...'); // Log more data

      // Check for errors from the Gemini API itself (sometimes returns 200 with an error object)
      if (data.error) {
        console.error('Gemini API returned error object:', data.error);
        return res.status(500).json({ // Return 500 as this is a server-side issue with the API
          message: 'Gemini API error',
          error: data.error,
          suggestions: []
        });
      }

      // Check if candidates or parts are missing, which can happen if the prompt fails
       if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
         console.error('Gemini response missing expected structure:', data);
         // Also check for promptFeedback which might indicate why it failed
         if (data.promptFeedback) {
             console.error('Prompt feedback:', data.promptFeedback);
         }
         return res.status(500).json({
            message: 'Gemini API did not return expected content structure. The prompt might have been rejected or failed.',
            error: data, // Include the full response data for debugging
            suggestions: []
         });
       }


      // Extract the suggestions from the Gemini response
      const suggestionsText = data.candidates[0].content.parts[0].text;
      // Split into lines and filter out empty ones
      const suggestions = suggestionsText.split('\n')
        .filter(line => line.trim().length > 0) // Ensure line is not just whitespace
        .map(line => line.replace(/^\s*\d+[\.\)]\s*/, '').trim()) // Remove optional leading whitespace, numbering (1., 2., 3), and trailing whitespace
        .filter(suggestion => suggestion.length > 0); // Ensure resulting suggestion is not empty after cleaning


      console.log('Extracted suggestions:', suggestions);

      // Send the suggestions back to your frontend
      return res.status(200).json({ suggestions: suggestions });

    } catch (fetchError) {
      console.error('Error calling Gemini API:', fetchError);
      return res.status(500).json({
        message: 'Error calling Gemini API',
        error: fetchError instanceof Error ? fetchError.message : String(fetchError), // Ensure error is a string
        suggestions: []
      });
    }

  } catch (error) {
    console.error('Error in API function handler:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error), // Ensure error is a string
      suggestions: []
    });
  }
}