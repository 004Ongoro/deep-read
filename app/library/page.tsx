import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import LibraryClient from "./LibraryClient";

interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  await connectToDatabase();
  
  const user = session.user as AuthUser;

  const documents = await DocumentModel.find({ 
    userId: user.id 
  }).sort({ updatedAt: -1 }).lean();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <LibraryClient initialDocuments={JSON.parse(JSON.stringify(documents))} />
      </main>

      <Footer />
    </div>
  );
}
