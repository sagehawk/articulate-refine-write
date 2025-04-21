
import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is the environment variable you set in Vercel's dashboard
// IMPORTANT: Make sure this variable name in Vercel does NOT start with VITE_
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers to avoid issues with cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { sentence } = req.body;

    if (!sentence) {
      return res.status(400).json({ message: 'Missing sentence' });
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY environment variable not set.');
      // Avoid exposing the exact error to the client for security
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Use the Lite model as discussed
    const modelName = 'gemini-2.0-flash-lite'; 

    // Use the API key in the server-to-server call
    const url = `https://generative-ai.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{
          text: `Please provide 3 alternative rewrites for the following sentence, making it clearer, more concise, and more engaging. Focus on improving the flow and impact while maintaining the original meaning. Format each suggestion on a new line starting with a number.\nSentence: ${sentence}\nRewrites:`
        }]
      }]
    };

    console.log('Calling Gemini API with sentence:', sentence);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API response not OK:', response.status, errorText);
      return res.status(response.status).json({ 
        message: `Gemini API error: ${response.status}`,
        error: errorText
      });
    }

    const data = await response.json();
    console.log('Gemini API response:', data);

    // Check for errors from the Gemini API itself
    if (data.error) {
      console.error('Gemini API error:', data.error);
      return res.status(500).json({ message: 'Gemini API error', error: data.error });
    }

    // Extract the suggestions from the Gemini response
    const suggestionsText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Split into lines and filter out empty ones
    const suggestions = suggestionsText.split('\n').filter(line => line.trim());
    
    console.log('Extracted suggestions:', suggestions);

    // Send the suggestions back to your frontend
    return res.status(200).json({ suggestions: suggestions }); // Send an array of strings

  } catch (error) {
    console.error('Error calling Gemini API from serverless function:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
