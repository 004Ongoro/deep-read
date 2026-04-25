import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DocumentModel } from "@/lib/models/Document";
import { processUrl } from "@/lib/utils/url-handler";
import connectToDatabase from "@/lib/db/mongodb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ message: "No URL provided" }, { status: 400 });
    }

    await connectToDatabase();

    // Process the URL
    const processed = await processUrl(url);

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
    console.error("URL Ingestion Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process URL";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
