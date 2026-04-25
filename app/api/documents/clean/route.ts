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

Please clean this text according to these rules:
1. REMOVE all non-narrative elements: headers, footers, page numbers, and irrelevant document metadata.
2. REMOVE front matter if present: If this page contains a Table of Contents, Preface, Introduction, Foreword, Dedication, Copyright page, or Glossary, return an empty string or a very brief indicator that it was removed. We want the text to start directly with the main content/chapters.
3. FIX formatting: Fix any weird line breaks, merge hyphenated words that were split across lines, and repair broken sentences caused by PDF extraction.
4. STRUCTURE: Use clean, readable Markdown. Use proper heading levels (e.g., # for Chapters, ## for sections), bullet points for lists, and italics/bold for emphasis if it was present in the original.
5. NO SUMMARY: Do NOT summarize, omit main narrative text, or hallucinate new information. Keep the original wording and meaning of the main content intact.
6. OUTPUT ONLY the raw Markdown text. Do not wrap it in \`\`\`markdown code blocks. Just the markdown text. If the entire page is "useless" (like a TOC or blank page), just return an empty string.`;

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