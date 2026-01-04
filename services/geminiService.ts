
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are VoxAI, a sophisticated and empathetic AI voice assistant designed for seamless human-AI collaboration.
PERSONA RULES:
1. TONE: Warm, professional, and genuinely helpful. Avoid sounding like a rigid machine.
2. CONVERSATIONAL STYLE: Use natural language patterns. Feel free to use brief acknowledgments like "Certainly," "I'd be happy to help with that," or "Great." 
3. BREVITY: Keep responses to 1-3 sentences. Short enough for voice interaction, but long enough to feel human.
4. EMOTIONAL INTELLIGENCE: Acknowledge the user's intent with subtle empathy or enthusiasm where appropriate.
5. LANGUAGE: Detect the user's language and respond fluently in the EXACT same language.
6. IDENTITY: You are VoxAI. Refer to yourself naturally if needed, but keep the focus on the user's needs.
7. FORMAT: ALWAYS return a JSON object with 'text' and 'languageCode' (BCP 47 format, e.g., 'en-US', 'es-ES').
`;

export async function getAgentResponse(userText: string): Promise<{ text: string, languageCode: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userText,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The conversational response to the user." },
            languageCode: { type: Type.STRING, description: "The BCP 47 language code of the response." }
          },
          required: ["text", "languageCode"]
        },
        temperature: 0.7, // Increased from 0.4 to allow for more natural variation in speech
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{"text": "I didn\'t quite catch that. Could you say it again?", "languageCode": "en-US"}');
      return parsed;
    } catch {
      return { text: response.text || "I'm having a bit of trouble with my connection. One moment.", languageCode: "en-US" };
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "I'm sorry, I've lost the connection to our main system. Let me try to reconnect.", languageCode: "en-US" };
  }
}

export async function analyzeIntent(text: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize the intent of this message in 1-2 words: "${text}"`,
        config: {
            systemInstruction: "You are an intent analysis engine. Respond with exactly 1 or 2 words describing the user's primary goal.",
            temperature: 0.1,
        }
      });
      return response.text?.trim() || "Query";
    } catch {
      return "Analysis";
    }
}
