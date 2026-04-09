import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, fileHash } = await req.json();

    await connectToDatabase();

    // Check if user already has this document registered
    let doc = await DocumentModel.findOne({ 
      fileHash, 
      userId: (session.user as any).id 
    });

    if (!doc) {
      doc = await DocumentModel.create({
        title,
        fileHash,
        userId: (session.user as any).id,
        currentChapter: 0,
        readingProgress: 0,
      });
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    console.error("Document Init Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}