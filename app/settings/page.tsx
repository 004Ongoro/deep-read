import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import SettingsClient from "./SettingsClient";

interface AuthUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user as AuthUser;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-foreground tracking-tight">Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your account and reading preferences.</p>
          </header>

          <SettingsClient user={{ name: user.name || "", email: user.email || "" }} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
