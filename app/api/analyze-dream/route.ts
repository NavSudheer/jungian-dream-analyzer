import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { dreamText } = await request.json();

    if (!dreamText || typeof dreamText !== 'string') {
      return NextResponse.json(
        { error: 'Dream text is required' },
        { status: 400 }
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

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are a Jungian psychologist specializing in dream analysis. Provide insightful interpretations based on Carl Jung's theories of the collective unconscious, archetypes, and dream symbolism." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // Extract the response
    const responseContent = completion.choices[0].message.content || '';
    
    // Parse the JSON from the response
    try {
      // The response might contain markdown formatting, so we need to extract just the JSON part
      const jsonMatch = responseContent?.match(/```json\n([\s\S]*?)\n```/) || 
                        responseContent?.match(/```\n([\s\S]*?)\n```/) || 
                        responseContent?.match(/({[\s\S]*})/);
      
      const jsonString = jsonMatch ? jsonMatch[1] : responseContent;
      const analysisData = JSON.parse(jsonString);
      
      // Add timestamp
      analysisData.timestamp = new Date();
      
      return NextResponse.json(analysisData);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      
      // If parsing fails, return the raw response
      return NextResponse.json({
        symbols: [],
        archetypes: [],
        interpretation: responseContent || "Could not generate interpretation",
        timestamp: new Date(),
        error: "Failed to parse structured data"
      });
    }
  } catch (error) {
    console.error("Error in dream analysis API:", error);
    return NextResponse.json(
      { error: "Failed to analyze dream" },
      { status: 500 }
    );
  }
} 