import { DreamAnalysis } from '../utils/types';

/**
 * Analyze a dream text using OpenAI API with streaming
 */
export const analyzeDream = async (
  dreamText: string, 
  onPartialResponse?: (text: string) => void
): Promise<DreamAnalysis> => {
  try {
    const response = await fetch('/api/analyze-dream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dreamText }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Handle streaming response
    if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let timestamp: Date | null = null;
      let completeResponse = '';

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        // Check if the first chunk contains the timestamp
        if (completeResponse === '' && chunk.startsWith('{')) {
          const endOfJson = chunk.indexOf('\n');
          if (endOfJson !== -1) {
            try {
              const timestampObj = JSON.parse(chunk.substring(0, endOfJson));
              timestamp = new Date(timestampObj.timestamp);
              
              // Add the rest of the chunk to the response
              const remainingChunk = chunk.substring(endOfJson + 1);
              completeResponse += remainingChunk;
              
              // Call the callback with the partial response
              if (onPartialResponse) {
                onPartialResponse(remainingChunk);
              }
              
              continue;
            } catch (e) {
              // If parsing fails, treat it as a normal chunk
              console.error('Error parsing timestamp:', e);
            }
          }
        }
        
        // Add the chunk to the complete response
        completeResponse += chunk;
        
        // Call the callback with the partial response
        if (onPartialResponse) {
          onPartialResponse(chunk);
        }
      }

      // Try to parse the complete response as JSON
      try {
        // The response might contain markdown formatting, so we need to extract just the JSON part
        const jsonMatch = completeResponse.match(/```json\n([\s\S]*?)\n```/) || 
                         completeResponse.match(/```\n([\s\S]*?)\n```/) || 
                         completeResponse.match(/({[\s\S]*})/);
        
        if (jsonMatch) {
          const jsonString = jsonMatch[1];
          const analysisData = JSON.parse(jsonString);
          
          // Add timestamp
          analysisData.timestamp = timestamp || new Date();
          
          return analysisData;
        }
      } catch (parseError) {
        console.error('Error parsing JSON from stream:', parseError);
      }

      // If JSON parsing fails, return a structured response with the raw text
      return {
        symbols: [],
        archetypes: [],
        interpretation: completeResponse,
        timestamp: timestamp || new Date(),
      };
    } else {
      // Handle non-streaming response (fallback)
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error analyzing dream:', error);
    
    // Return a fallback analysis in case of error
    return {
      symbols: [],
      archetypes: [],
      interpretation: 'Sorry, we encountered an error analyzing your dream. Please try again later.',
      timestamp: new Date(),
    };
  }
}; 