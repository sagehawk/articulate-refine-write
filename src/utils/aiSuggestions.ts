
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get AI suggestions');
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    throw error;
  }
};
