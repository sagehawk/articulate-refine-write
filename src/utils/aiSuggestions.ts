
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function getAISuggestions(sentence: string): Promise<string[]> {
  const modelName = 'gemini-2.0-flash-001';
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable not set');
  }

  const url = `https://generative-ai.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{
      role: 'user',
      parts: [{
        text: `Please provide 3 alternative rewrites for the following sentence, making it clearer, more concise, and more engaging. Focus on improving the flow and impact while maintaining the original meaning. Format each suggestion on a new line starting with a number.\nSentence: ${sentence}\nRewrites:`
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const suggestions = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return suggestions.split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    throw error;
  }
}
