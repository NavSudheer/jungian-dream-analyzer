import { DreamAnalysis } from '../utils/types';

/**
 * Analyze a dream text using OpenAI API
 */
export const analyzeDream = async (dreamText: string): Promise<DreamAnalysis> => {
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

    const data = await response.json();
    return data;
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