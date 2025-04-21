
// Client-side function to call our serverless function
export const getAISuggestions = async (sentence: string): Promise<string[]> => {
  try {
    // Make sure we're using a fully-qualified URL path
    const response = await fetch('/api/aiSuggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sentence }),
    });

    // Log the response for debugging
    console.log('Raw response status:', response.status, response.statusText);

    // First check if the response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to get error details if available
      let errorMessage = 'Failed to get AI suggestions';
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing JSON error response:', parseError);
        }
      } else {
        // If not JSON, just use the status text
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
        console.error('Non-JSON error response:', await response.text());
      }
      
      throw new Error(errorMessage);
    }

    // Parse the successful response
    const data = await response.json();
    console.log('API response data:', data);
    
    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      console.warn('API returned unexpected format:', data);
      return [];
    }
    
    return data.suggestions;
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    throw error;
  }
};
