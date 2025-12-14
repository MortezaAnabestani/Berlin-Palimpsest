import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NarrativeContent, Language } from "../types";

export const generateBerlinNarrative = async (
  apiKey: string,
  themeContext: string,
  language: Language
): Promise<NarrativeContent> => {
  const ai = new GoogleGenAI({ apiKey });

  const langName = language === 'de' ? 'German' : language === 'fa' ? 'Persian (Farsi)' : 'English';
  
  // We cannot use strict JSON schema with Tools (Search), so we instruct the model via prompt.
  const systemPrompt = `
    You are a literary engine for the "Berliner Künstlerprogramm". 
    Your task is to generate a "Palimpsest" narrative: a short, poetic, yet strictly documentary text about a specific location in Berlin.
    
    AESTHETICS:
    - Tone: Melancholic, objective, brutalist, precise.
    - Avoid clichés. Focus on underrepresented voices, migration, gender, or the physical texture of the city.
    - The narrative should feel like a memory etched into the concrete.

    REQUIREMENTS:
    1. Select a REAL, SPECIFIC location in Berlin related to: "${themeContext}".
    2. Write a short literary paragraph (max 60 words) in ${langName}.
    3. Provide one HARD, VERIFIABLE HISTORICAL FACT about this exact spot. This must be accurate. Use Google Search to verify dates and names.
    4. Provide approximate latitude/longitude for this location.

    OUTPUT FORMAT:
    You must return a valid JSON object. Do not wrap it in markdown. The JSON must match this structure:
    {
      "title": "string (max 3 words)",
      "narrative": "string (poetic text)",
      "locationName": "string",
      "historicalFact": "string (strictly factual)",
      "year": "string (year of fact)",
      "coordinates": { "lat": number, "lng": number }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate the Berlin narrative for theme: ${themeContext}. Return JSON only.`,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }], 
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    // Clean up potential markdown formatting (```json ... ```)
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    // Sanitize Coordinates to prevent NaN errors
    const lat = Number(parsed.coordinates?.lat);
    const lng = Number(parsed.coordinates?.lng);
    
    const isValidCoordinate = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    // Fallback to Berlin Center if coordinates are invalid
    const coordinates = isValidCoordinate 
      ? { lat, lng } 
      : { lat: 52.5200, lng: 13.4050 };

    if (!isValidCoordinate) {
        console.warn("AI returned invalid coordinates. Defaulting to Berlin center.");
    }
    
    return {
        title: parsed.title || "Unknown Trace",
        narrative: parsed.narrative || "No narrative generated.",
        locationName: parsed.locationName || "Berlin",
        historicalFact: parsed.historicalFact || "Historical data unavailable.",
        year: parsed.year || "N/A",
        coordinates: coordinates
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};