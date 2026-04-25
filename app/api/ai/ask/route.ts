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

    const { documentId, question, selection } = await req.json();

    if (!documentId || !question) {
      return NextResponse.json({ message: "Missing documentId or question" }, { status: 400 });
    }

    await connectToDatabase();
    
    const doc = await DocumentModel.findOne({ 
      _id: documentId, 
      userId: (session.user as { id: string }).id 
    });

    if (!doc) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    const contextText = doc.extractedText?.map(t => t.content).join("\n\n").slice(0, 20000) || "";

    const prompt = `You are a helpful learning assistant for a platform called Deep Read.
    Answer the following question about the document titled "${doc.title}".
    
    ${selection ? `The user has highlighted this specific text: "${selection}"` : ""}
    
    DOCUMENT CONTEXT (abridged):
    ${contextText}
    
    QUESTION:
    ${question}
    
    Provide a clear, helpful answer in Markdown format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const answer = response.text || "";

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    console.error("Ask AI Error:", error);
    return NextResponse.json({ message: "Failed to get answer from AI" }, { status: 500 });
  }
}
