import Link from "next/link";
import { ArrowLeft, Ghost } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 rounded-full bg-accent/5 blur-2xl" />
          <Ghost size={80} className="relative text-accent/20" strokeWidth={1} />
          <span className="absolute -bottom-2 -right-2 rounded-full bg-accent px-3 py-1 text-sm font-black text-white shadow-xl">
            404
          </span>
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
          Lost in the margins?
        </h1>
        <p className="mt-4 max-w-md text-lg text-gray-500">
          The page you are looking for doesn&apos;t exist or has been moved to another chapter.
        </p>
        
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 font-black text-white shadow-2xl shadow-accent/20 transition-all hover:bg-accent-dark active:scale-95"
          >
            <ArrowLeft size={20} /> Back to Library
          </Link>
          <Link 
            href="/library" 
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-8 py-4 font-bold text-gray-600 transition-all hover:border-accent hover:text-accent"
          >
            My Documents
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
