import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";
import ReaderClient from "./ReaderClient";

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  await connectToDatabase();
  
  const document = await DocumentModel.findOne({ 
    _id: id,
    userId: (session.user as any).id 
  }).lean();

  if (!document) {
    notFound();
  }

  return (
    <ReaderClient document={JSON.parse(JSON.stringify(document))} />
  );
}
