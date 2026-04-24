import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface AuthUser {
  id: string;
}

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { documentId, currentChapter, readingProgress, lastReadAnchor } = await req.json();

    await connectToDatabase();

    const user = session.user as AuthUser;

    const doc = await DocumentModel.findOneAndUpdate(
      { _id: documentId, userId: user.id },
      { 
        currentChapter, 
        readingProgress, 
        lastReadAnchor,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!doc) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(doc, { status: 200 });
  } catch (error) {
    console.error("Document Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
