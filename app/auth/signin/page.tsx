/**
 * app/auth/signin/page.tsx
 * Updated with registration link and visibility fixes.
 */
"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-background">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-accent/5 border border-gray-100">
        
        {/* Left: Illustration Side */}
        <div className="hidden w-1/2 flex-col justify-center bg-accent/5 p-12 md:flex border-r border-gray-50">
          <div className="relative w-full h-[300px]"> {/* Explicit height for visibility */}
            <Image 
              src="/login.svg" 
              alt="Deep Read Login" 
              fill 
              className="object-contain"
              priority 
            />
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Your focus, reclaimed.</h2>
            <p className="mt-2 text-gray-500 italic text-sm">&ldquo;The reading of all good books is like a conversation with the finest minds of past centuries.&rdquo;</p>
          </div>
        </div>

        {/* Right: Form Side */}
        <div className="w-full p-8 md:w-1/2 lg:p-16">
          <div className="flex flex-col items-center md:items-start">
            <Image src="/icon.png" alt="Icon" width={48} height={48} className="mb-6" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Deep Read</h1>
            <p className="mt-2 text-gray-500">Log in to your sanctuary.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="email"
                  type="email" 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  name="password"
                  type="password" 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-accent py-4 font-bold text-white transition-all hover:bg-accent-dark active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-accent/20"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Open Library <ArrowRight size={18} /></>}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account? <Link href="/auth/signup" className="font-bold text-accent hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}