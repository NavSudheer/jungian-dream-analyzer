import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log("Dream analysis API called");
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return new Response(
        JSON.stringify({ 
          error: "API configuration error", 
          interpretation: "Sorry, there was an error with our API configuration. Please try again later." 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { dreamText } = await request.json();
    console.log("Received dream text:", dreamText.substring(0, 50) + "...");

    if (!dreamText || typeof dreamText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Dream text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare the prompt for Jungian dream analysis
    const prompt = `
      Analyze the following dream using Jungian psychology principles:
      
      Dream: "${dreamText}"
      
      Please provide a detailed analysis that includes:
      1. Identification of key symbols in the dream and their Jungian interpretations
      2. Identification of archetypes present in the dream
      3. A comprehensive interpretation of the dream based on Jungian psychology
      4. Format the response as a JSON object with the following structure:
      {
        "symbols": [
          { "name": "symbol name", "meaning": "symbol meaning", "frequency": number of occurrences }
        ],
        "archetypes": [
          { "type": "archetype name", "description": "brief description", "significance": "significance in the dream" }
        ],
        "interpretation": "comprehensive interpretation text"
      }
    `;

    // Create a streaming response
    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are a Jungian psychologist specializing in dream analysis. Provide insightful interpretations based on Carl Jung's theories of the collective unconscious, archetypes, and dream symbolism. Always respond with valid JSON." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        stream: true,
      });
      
      console.log("OpenAI stream created successfully");
      
      // Create a ReadableStream for the response
      const readableStream = new ReadableStream({
        async start(controller) {
          // Initialize the analysis object
          const initialAnalysis = {
            symbols: [],
            archetypes: [],
            interpretation: "",
            timestamp: new Date()
          };
          
          // Send the initial analysis object
          controller.enqueue(JSON.stringify(initialAnalysis) + '\n');
          
          let accumulatedJson = "";
          let currentAnalysis = { ...initialAnalysis };
          let currentInterpretation = "";
          let lastSentLength = 0;
          
          // Process each chunk from OpenAI
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // Accumulate the JSON string
              accumulatedJson += content;
              
              // Try to extract interpretation text as it comes in
              try {
                // Look for interpretation field in the accumulated JSON
                const interpretationMatch = accumulatedJson.match(/"interpretation"\s*:\s*"([^"]*)/);
                if (interpretationMatch && interpretationMatch[1]) {
                  currentInterpretation = interpretationMatch[1];
                  
                  // Only send update if we have new content to show (at least 5 new characters)
                  if (currentInterpretation.length > lastSentLength + 5 || content.includes(".") || content.includes("!") || content.includes("?")) {
                    currentAnalysis.interpretation = currentInterpretation;
                    lastSentLength = currentInterpretation.length;
                    controller.enqueue(JSON.stringify(currentAnalysis) + '\n');
                  }
                }
                
                // Try to parse complete JSON objects when possible
                if (accumulatedJson.includes('}')) {
                  const jsonMatch = accumulatedJson.match(/({[\s\S]*})/);
                  if (jsonMatch) {
                    try {
                      const parsedJson = JSON.parse(jsonMatch[1]);
                      
                      // Update the current analysis with any new data
                      if (parsedJson.symbols) {
                        currentAnalysis.symbols = parsedJson.symbols;
                      }
                      if (parsedJson.archetypes) {
                        currentAnalysis.archetypes = parsedJson.archetypes;
                      }
                      if (parsedJson.interpretation) {
                        currentAnalysis.interpretation = parsedJson.interpretation;
                        lastSentLength = currentAnalysis.interpretation.length;
                      }
                      
                      // Send the updated analysis
                      controller.enqueue(JSON.stringify(currentAnalysis) + '\n');
                    } catch (e) {
                      // Ignore parsing errors for incomplete JSON
                    }
                  }
                }
              } catch (e) {
                // Ignore parsing errors for partial data
              }
            }
          }
          
          // Try one final parse of the complete response
          try {
            // The response might be wrapped in markdown code blocks
            const jsonMatch = accumulatedJson.match(/```json\n([\s\S]*?)\n```/) || 
                             accumulatedJson.match(/```\n([\s\S]*?)\n```/) || 
                             accumulatedJson.match(/({[\s\S]*})/);
            
            if (jsonMatch) {
              const jsonString = jsonMatch[1];
              const finalAnalysis = JSON.parse(jsonString);
              
              // Send the final complete analysis
              controller.enqueue(JSON.stringify({
                ...finalAnalysis,
                timestamp: initialAnalysis.timestamp
              }) + '\n');
            }
          } catch (e) {
            // If final parsing fails, send what we have
            controller.enqueue(JSON.stringify(currentAnalysis) + '\n');
          }
          
          controller.close();
        },
      });

      // Return the streaming response
      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError);
      
      // Return a fallback response with an error message
      return new Response(
        JSON.stringify({
          symbols: [],
          archetypes: [],
          interpretation: "Sorry, we encountered an error connecting to our analysis service. Please try again later.",
          timestamp: new Date(),
          error: openaiError.message || "Unknown OpenAI error"
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error("Error in dream analysis API:", error);
    
    // Return a more detailed error response
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze dream", 
        message: error.message || "Unknown error",
        symbols: [],
        archetypes: [],
        interpretation: "Sorry, we encountered an error analyzing your dream. Please try again later.",
        timestamp: new Date()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 