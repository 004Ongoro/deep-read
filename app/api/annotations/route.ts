import connectToDatabase from "@/lib/db/mongodb";
import { Annotation } from "@/lib/models/Annotation";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ message: "Missing documentId" }, { status: 400 });
    }

    await connectToDatabase();
    
    const annotations = await Annotation.find({
      documentId,
      userId: (session.user as { id: string }).id
    }).sort({ createdAt: 1 });

    return NextResponse.json(annotations);
  } catch (error) {
    console.error("GET Annotations Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { _id, documentId, pageIndex, type, color, content, quote, range } = body;

    if (!documentId || !quote) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as { id: string }).id;

    let annotation;
    if (_id) {
      annotation = await Annotation.findOneAndUpdate(
        { _id, userId },
        { type, color, content, quote, range, updatedAt: new Date() },
        { new: true }
      );
    } else {
      annotation = await Annotation.create({
        userId,
        documentId,
        pageIndex,
        type,
        color,
        content,
        quote,
        range
      });
    }

    return NextResponse.json(annotation);
  } catch (error) {
    console.error("POST Annotation Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    await connectToDatabase();
    
    const result = await Annotation.findOneAndDelete({
      _id: id,
      userId: (session.user as { id: string }).id
    });

    if (!result) {
      return NextResponse.json({ message: "Annotation not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE Annotation Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
