import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ message: "Missing documentId" }, { status: 400 });
    }

    await connectToDatabase();
    
    const doc = await DocumentModel.findOne({ 
      _id: documentId, 
      userId: (session.user as { id: string }).id 
    });

    if (!doc) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    // Combine some text for summarization (don't send everything if it's huge)
    const fullText = doc.extractedText?.map(t => t.content).join("\n\n").slice(0, 30000) || "";

    if (!fullText) {
      return NextResponse.json({ message: "No text to summarize" }, { status: 400 });
    }

    const prompt = `Summarize the following document titled "${doc.title}". 
    Provide a concise yet comprehensive summary in Markdown format. 
    Focus on the main arguments, key takeaways, and overall structure.
    
    TEXT:
    ${fullText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    
    const summary = response.text || "";

    doc.summary = summary;
    await doc.save();

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error) {
    console.error("Summarization Error:", error);
    return NextResponse.json({ message: "Failed to generate summary" }, { status: 500 });
  }
}
