import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";
import ReaderClient from "./ReaderClient";

interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  await connectToDatabase();
  
  const user = session.user as AuthUser;
  
  const document = await DocumentModel.findOne({ 
    _id: id,
    userId: user.id 
  }).lean();

  if (!document) {
    notFound();
  }

  return (
    <ReaderClient document={JSON.parse(JSON.stringify(document))} />
  );
}
