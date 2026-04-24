import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/db/mongodb";
import { DocumentModel } from "@/lib/models/Document";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import DashboardClient from "@/components/dashboard/DashboardClient";
import LandingPage from "@/components/landing/LandingPage";

interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return <LandingPage />;
  }

  await connectToDatabase();
  
  const user = session.user as AuthUser;

  // Fetch user's reading list
  const documents = await DocumentModel.find({ 
    userId: user.id 
  }).sort({ updatedAt: -1 }).lean();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome back, <span className="text-accent">{session.user.name?.split(' ')[0]}</span>
            </h1>
            <p className="mt-2 text-gray-500">Pick up where your mind left off.</p>
          </header>

          {/* Client-side logic for Upload & Interactions */}
          <DashboardClient initialDocuments={JSON.parse(JSON.stringify(documents))} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
