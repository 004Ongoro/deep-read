import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing ID" }, { status: 400 });
    }

    await connectToDatabase();

    const doc = await DocumentModel.findOneAndDelete({ 
      _id: id, 
      userId: (session.user as any).id 
    });

    if (!doc) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Document Delete Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
