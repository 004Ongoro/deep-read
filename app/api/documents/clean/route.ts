import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ message: "No text provided" }, { status: 400 });
    }

    const prompt = `You are an expert editor and document cleaner.
    
Here is the raw text extracted from a single page of a PDF document:

"""
${text}
"""

Please clean this text. 
1. Remove all headers, footers, page numbers, and irrelevant document metadata.
2. Fix any weird line breaks or hyphenated words caused by PDF extraction.
3. Structure it into clean, readable Markdown (using headings, lists, or bold text where appropriate).
4. Do NOT summarize or hallucinate new information. Keep the original meaning and core text intact.
5. Output ONLY the raw Markdown text. Do not wrap it in \`\`\`markdown code blocks. Just the markdown text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const cleanedMarkdown = response.text || "";

    return NextResponse.json({ markdown: cleanedMarkdown }, { status: 200 });
  } catch (error) {
    console.error("Gemini Cleaning Error:", error);
    return NextResponse.json({ message: "Failed to clean text with Gemini" }, { status: 500 });
  }
}