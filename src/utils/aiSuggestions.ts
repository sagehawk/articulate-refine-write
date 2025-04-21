// src/utils/aiSuggestions.ts

// Define the expected structure of the response from your serverless function
interface RewriteResponse {
  suggestions?: string[]; // Your serverless function will return an array of strings here
  message?: string; // For error messages from your serverless function
  error?: any; // For detailed error info from your serverless function or Gemini
}

/**
 * Fetches AI-generated suggestions for a given sentence by calling a serverless API route.
 * @param sentence The sentence to get suggestions for.
 * @returns A promise that resolves to an array of string suggestions.
 * @throws An error if the API call or response processing fails.
 */
export async function getAISuggestions(sentence: string): Promise<string[]> {
  // THIS IS THE KEY CHANGE: Call your local serverless function endpoint
  const url = '/api/rewrite';

  // The request body for YOUR serverless function
  const requestBody = {
    sentence: sentence // Send the sentence in the body
  };

  try {
    // Make the fetch call to YOUR serverless function
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Parse the JSON response from YOUR serverless function
    const data: RewriteResponse = await response.json();

    // Check if your serverless function returned an error status
    if (!response.ok) {
      const errorMessage = data.message || 'Unknown error from serverless function';
      // Log the full error data for debugging on the serverless function side
      console.error('Error response from /api/rewrite:', data);
      throw new Error(`Server error: ${errorMessage}`);
    }

    // If successful, return the suggestions array from the serverless function's response
    return data.suggestions || []; // Assuming your serverless function sends back { suggestions: [...] }

  } catch (error) {
    console.error('Error calling serverless function for AI suggestions:', error);
    // Re-throw the error so your frontend component can catch it
    throw error;
  }
}
