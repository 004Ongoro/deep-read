"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-background">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-accent/5 border border-gray-100">
        
        {/* Right Form Side First on Mobile */}
        <div className="w-full p-8 md:w-1/2 lg:p-16">
          <div className="flex flex-col items-center md:items-start">
            <Image src="/icon.png" alt="Icon" width={48} height={48} className="mb-6" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h1>
            <p className="mt-2 text-gray-500 text-sm">Join the community of deep readers.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && <div className="text-red-500 text-xs font-bold">{error}</div>}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input name="name" type="text" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 outline-none focus:border-accent" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input name="email" type="email" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 outline-none focus:border-accent" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input name="password" type="password" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 outline-none focus:border-accent" required />
              </div>
            </div>

            <button disabled={isLoading} className="w-full rounded-xl bg-accent py-4 font-bold text-white mt-4 shadow-lg shadow-accent/20">
              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Start Reading"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already a member? <Link href="/auth/signin" className="font-bold text-accent">Sign In</Link>
          </p>
        </div>

        {/* Left Side Illustration */}
        <div className="hidden w-1/2 flex-col justify-center bg-accent/5 p-12 md:flex border-l border-gray-50">
           <div className="relative w-full h-[300px]">
             <Image src="/login.svg" alt="Reading" fill className="object-contain" />
           </div>
        </div>
      </div>
    </div>
  );
}
