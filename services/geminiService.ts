import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safely initialize the client only if the key exists to prevent immediate crashes in dev
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiResponse = async (
  prompt: string,
  contextCode: string
): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini API Key is missing.");
  }

  // Basic validation to prevent empty prompts causing 500 errors
  if (!prompt || !prompt.trim()) {
    return "Please provide a valid prompt.";
  }

  try {
    // Escape the context code to avoid Markdown parsing issues
    const safeContextCode = contextCode.replace(/`/g, '\\`');

    const fullPrompt = `
You are an expert scientific programmer and data visualization specialist.
The user is looking at the following code snippet:

\`\`\`
${safeContextCode}
\`\`\`

The user has a question or request: "${prompt}"

If they are asking to modify the code, return ONLY the full modified code block wrapped in markdown code fences (e.g., \`\`\`python ... \`\`\`).
If they are asking for an explanation, provide a concise, clear explanation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    if (!response || !response.text) {
        return "I couldn't generate a response. Please try rephrasing your request.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return a user-friendly error message
    if (error.message && error.message.includes("500")) {
        return "The AI service is currently experiencing high traffic or an internal error. Please try again in a few moments.";
    }
    return "Failed to communicate with AI Assistant. Please check your network or API key.";
  }
};
