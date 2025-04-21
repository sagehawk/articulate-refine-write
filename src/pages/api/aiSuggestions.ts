
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

    console.log('Calling Gemini API with sentence:', sentence);
    
    try {
      const url = `https://generative-ai.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

      const requestBody = {
        contents: [{
          role: 'user',
          parts: [{
            text: `Please provide 3 alternative rewrites for the following sentence, making it clearer, more concise, and more engaging. Focus on improving the flow and impact while maintaining the original meaning. Format each suggestion on a new line starting with a number.\nSentence: ${sentence}\nRewrites:`
          }]
        }]
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
      console.log('Gemini API response:', JSON.stringify(data).substring(0, 200) + '...');

      // Check for errors from the Gemini API itself
      if (data.error) {
        console.error('Gemini API error:', data.error);
        return res.status(500).json({ 
          message: 'Gemini API error', 
          error: data.error,
          suggestions: [] 
        });
      }

      // Extract the suggestions from the Gemini response
      const suggestionsText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      // Split into lines and filter out empty ones
      const suggestions = suggestionsText.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim()); // Remove numbering
      
      console.log('Extracted suggestions:', suggestions);

      // Send the suggestions back to your frontend
      return res.status(200).json({ suggestions: suggestions });

    } catch (fetchError) {
      console.error('Error calling Gemini API:', fetchError);
      return res.status(500).json({ 
        message: 'Error calling Gemini API', 
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        suggestions: [] 
      });
    }

  } catch (error) {
    console.error('Error in API function:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: [] 
    });
  }
}
