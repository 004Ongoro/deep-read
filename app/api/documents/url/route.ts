import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DocumentModel } from "@/lib/models/Document";
import { processUrl } from "@/lib/utils/url-handler";
import connectToDatabase from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("POST /api/documents/url - Start");
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Missing");
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;
    console.log("URL to process:", url);

    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "No URL provided" }, { status: 400 });
    }

    console.log("Connecting to database...");
    await connectToDatabase();

    // Process the URL
    console.log("Processing URL...");
    const processed = await processUrl(url);
    console.log("URL processed successfully:", processed.title);

    // Check if user already has this document
    let doc = await DocumentModel.findOne({
      userId: (session.user as { id: string }).id,
      fileHash: processed.fileHash,
    });

    if (doc) {
      return NextResponse.json(doc, { status: 200 });
    }

    // Create new document
    doc = await DocumentModel.create({
      userId: (session.user as { id: string }).id,
      title: processed.title,
      fileHash: processed.fileHash,
      sourceType: 'url',
      totalChapters: 1,
      currentChapter: 1,
      extractedText: [{
        chapterIndex: 0,
        title: processed.title,
        content: processed.content,
      }],
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error: unknown) {
    console.error("URL Ingestion Error DETAILS:", error);
    
    let errorMessage = "Failed to process URL";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("Stack trace:", error.stack);
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
