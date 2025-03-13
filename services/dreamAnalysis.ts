import { DreamAnalysis } from '../utils/types';

/**
 * Analyze a dream text using OpenAI API with streaming
 */
export const analyzeDream = async (
  dreamText: string, 
  onPartialResponse?: (analysis: DreamAnalysis) => void
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

      let latestAnalysis: DreamAnalysis | null = null;
      let buffer = '';
      let decoder = new TextDecoder();

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process each line in the buffer
        let lineEndIndex;
        while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.substring(0, lineEndIndex).trim();
          buffer = buffer.substring(lineEndIndex + 1);
          
          if (line) {
            try {
              // Parse the JSON line
              const analysisUpdate = JSON.parse(line);
              
              // Ensure timestamp is a Date object
              if (analysisUpdate.timestamp && typeof analysisUpdate.timestamp === 'string') {
                analysisUpdate.timestamp = new Date(analysisUpdate.timestamp);
              }
              
              // Update the latest analysis
              latestAnalysis = analysisUpdate;
              
              // Call the callback with the partial analysis
              if (onPartialResponse) {
                onPartialResponse(analysisUpdate);
              }
            } catch (e) {
              console.error('Error parsing JSON from stream:', e);
            }
          }
        }
      }

      // Process any remaining buffer content
      if (buffer.trim()) {
        try {
          const analysisUpdate = JSON.parse(buffer.trim());
          
          // Ensure timestamp is a Date object
          if (analysisUpdate.timestamp && typeof analysisUpdate.timestamp === 'string') {
            analysisUpdate.timestamp = new Date(analysisUpdate.timestamp);
          }
          
          latestAnalysis = analysisUpdate;
          
          if (onPartialResponse) {
            onPartialResponse(analysisUpdate);
          }
        } catch (e) {
          console.error('Error parsing final JSON from stream:', e);
        }
      }

      // Return the latest analysis or a fallback
      return latestAnalysis || {
        symbols: [],
        archetypes: [],
        interpretation: 'No valid analysis was received.',
        timestamp: new Date(),
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