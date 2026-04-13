import { GoogleGenerativeAI } from "@google/generative-ai";
import { geminiTextModel } from "@/config/gemini-models";

export async function validateEducationalPrompt(prompt: string): Promise<boolean> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: geminiTextModel });

  const validationPrompt = `You are a validator. Determine if the following prompt is related to education or educational concepts.

Prompt: "${prompt}"

Return ONLY "true" if related to education (mathematics, science, history, literature, geography, physics, chemistry, biology, learning, teaching, academic subjects, etc.).
Return ONLY "false" if NOT related to education.

Your response must be EXACTLY one word: either "true" or "false".`;

  try {
    const result = await model.generateContent(validationPrompt);
    const text = result.response.text().trim().toLowerCase();
    return text.split(/\s+/)[0] === "true";
  } catch {
    throw new Error("Failed to validate prompt");
  }
}
