"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/auth/signin?registered=true");
      } else {
        const errData = await res.json();
        setError(errData.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-background transition-theme">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-[40px] bg-card shadow-2xl shadow-accent/10 border border-border">
        
        {/* Left Side Illustration */}
        <div className="hidden w-1/2 flex-col justify-center bg-muted/30 p-12 md:flex border-r border-border">
           <div className="relative w-full h-[350px]">
             <Image src="/login.svg" alt="Reading" fill className="object-contain" />
           </div>
           <div className="mt-12 text-center">
            <h2 className="text-3xl font-black text-foreground italic">Start your journey.</h2>
            <p className="mt-4 text-muted-foreground italic text-base max-w-sm mx-auto">Transform the way you interact with information. Built for those who read to learn.</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full p-10 md:w-1/2 lg:p-20">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-8 hover:scale-110 transition-transform">
               <Image src="/logo.svg" alt="Deep Read" width={140} height={40} />
            </Link>
            <h1 className="text-4xl font-black text-foreground tracking-tight italic">Create Account</h1>
            <p className="mt-3 text-lg text-muted-foreground">Join the community of deep readers.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {error && (
              <div className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-500 border border-red-500/20">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={20} />
                <input 
                  name="name" 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-border bg-muted/20 py-4 pl-12 pr-6 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-foreground" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={20} />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-border bg-muted/20 py-4 pl-12 pr-6 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-foreground" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={20} />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-border bg-muted/20 py-4 pl-12 pr-6 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-foreground" 
                  required 
                />
              </div>
            </div>

            <button 
              disabled={isLoading} 
              className="group relative w-full overflow-hidden rounded-[20px] bg-accent py-5 font-black text-accent-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-70 shadow-2xl shadow-accent/20 mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Start Reading <ArrowRight size={20} /></>}
              </span>
            </button>
          </form>

          <p className="mt-12 text-center text-base text-muted-foreground">
            Already a member? <Link href="/auth/signin" className="font-black text-accent hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}