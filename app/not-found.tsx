import Link from "next/link";
import { ArrowLeft, Ghost } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-theme">
      <Navbar />
      
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-8 rounded-full bg-accent/10 blur-3xl" />
          <Ghost size={100} className="relative text-accent/30" strokeWidth={1} />
          <span className="absolute -bottom-2 -right-2 rounded-full bg-accent px-4 py-1.5 text-sm font-black text-accent-foreground shadow-2xl">
            404
          </span>
        </div>
        
        <h1 className="text-5xl font-black text-foreground tracking-tight sm:text-6xl italic">
          Lost in the margins?
        </h1>
        <p className="mt-6 max-w-md text-xl text-muted-foreground leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved to another chapter in our digital library.
        </p>
        
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-3 rounded-[20px] bg-accent px-10 py-5 text-lg font-black text-accent-foreground shadow-2xl shadow-accent/20 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={22} /> Back to Library
          </Link>
          <Link 
            href="/library" 
            className="flex items-center justify-center gap-3 rounded-[20px] border border-border bg-card px-10 py-5 text-lg font-bold text-muted-foreground transition-all hover:border-accent hover:text-accent"
          >
            My Documents
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
