
import { GoogleGenAI } from "@google/genai";

// Always initialize with named parameter and use process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  prompt: string,
  contextCode: string
): Promise<string> => {
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

    // Use gemini-3-pro-preview for complex reasoning and coding tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: fullPrompt,
    });

    // Directly access the .text property from the response
    const text = response.text;

    if (!text) {
        return "I couldn't generate a response. Please try rephrasing your request.";
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return a user-friendly error message
    if (error.message && error.message.includes("500")) {
        return "The AI service is currently experiencing high traffic or an internal error. Please try again in a few moments.";
    }
    return "Failed to communicate with AI Assistant. Please check your network or API key.";
  }
};
