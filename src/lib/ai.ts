import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export function getGeminiClient() {
  if (!API_KEY) {
    throw new Error("Missing GOOGLE_GEMINI_API_KEY");
  }

  return new GoogleGenerativeAI(API_KEY);
}

