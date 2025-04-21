
// Client-side function to call our serverless function
export const getAISuggestions = async (sentence: string): Promise<string[]> => {
  try {
    const response = await fetch('/api/aiSuggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sentence }),
    });

    // First check if the response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to get error details if available
      let errorMessage = 'Failed to get AI suggestions';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If we can't parse the response as JSON, use the status text
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse the successful response
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    throw error;
  }
};
