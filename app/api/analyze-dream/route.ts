import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { dreamText } = await request.json();

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
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a Jungian psychologist specializing in dream analysis. Provide insightful interpretations based on Carl Jung's theories of the collective unconscious, archetypes, and dream symbolism." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      stream: true,
    });

    // Create a ReadableStream for the response
    const readableStream = new ReadableStream({
      async start(controller) {
        // Send a timestamp at the beginning
        controller.enqueue(JSON.stringify({ timestamp: new Date() }) + '\n');

        // Process each chunk from OpenAI
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(content);
          }
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
  } catch (error) {
    console.error("Error in dream analysis API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze dream" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 