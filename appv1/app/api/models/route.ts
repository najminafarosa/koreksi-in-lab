import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function GET() {
  try {
    const result = await ai.models.list();

    return Response.json(result);
  } catch (error) {
    console.error("MODEL LIST ERROR:", error);

    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}