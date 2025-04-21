
// Client-side function to call our serverless function
export const getAISuggestions = async (sentence: string): Promise<string[]> => {
  try {
    console.log('Sending request to AI suggestions API with sentence:', sentence);
    
    // Use absolute URL for API endpoint to ensure it works in all environments
    const apiUrl = '/api/aiSuggestions';
    
    console.log('Using API URL:', apiUrl);
    
    // Make the request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sentence }),
    });

    // Log the response for debugging
    console.log('Raw response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));

    // First check if the response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = 'Failed to get AI suggestions';
      
      try {
        // Try to parse as JSON first
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('JSON error response:', errorData);
        } else {
          // If not JSON, just use the status text and log the text content
          const textContent = await response.text();
          console.error('Non-JSON error response:', textContent);
          errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    // Check for HTML response (which would indicate we're getting a page instead of JSON)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON');
      const htmlContent = await response.text();
      console.log('HTML response preview:', htmlContent.substring(0, 100));
      throw new Error('Received HTML instead of JSON data from the server');
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
