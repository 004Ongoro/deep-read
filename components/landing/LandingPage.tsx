"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Zap, Shield, Smartphone, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/10 selection:text-accent">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                  </span>
                  Reclaiming the Flow State
                </div>
                <h1 className="mt-8 text-5xl font-black tracking-tight text-gray-900 sm:text-7xl">
                  Read deeper, <br />
                  <span className="text-accent italic">not faster.</span>
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-700">
                  The personal learning environment that transforms cluttered PDFs into 
                  focused, reflowable text. No distractions. No lost progress. Just you and the material.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link 
                    href="/auth/signup" 
                    className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 text-lg font-black text-white shadow-2xl shadow-accent/20 transition-all hover:bg-accent-dark hover:scale-105 active:scale-95"
                  >
                    Start Reading Free <ArrowRight size={20} />
                  </Link>
                  <Link 
                    href="#features" 
                    className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-4 text-lg font-bold text-gray-600 transition-all hover:border-accent hover:text-accent"
                  >
                    View Features
                  </Link>
                </div>
                <div className="mt-8 flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                        <div className="h-full w-full bg-accent/20" />
                      </div>
                    ))}
                  </div>
                  <span>Joined by 500+ students & researchers</span>
                </div>
              </div>
              
              <div className="relative lg:ml-10">
                <div className="absolute -inset-4 rounded-[40px] bg-accent/5 blur-3xl" />
                <div className="relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-4 shadow-2xl">
                  <Image 
                    src="/login.svg" 
                    alt="Deep Read Interface" 
                    width={600} 
                    height={400}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section id="features" className="bg-gray-50 py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-lg font-bold uppercase tracking-widest text-accent">The Core Engine</h2>
              <p className="mt-4 text-4xl font-black text-gray-900">Built for cognitive endurance.</p>
            </div>

            <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Zap className="text-accent" />,
                  title: "Semantic Anchoring",
                  desc: "We don't just remember your page; we remember the exact paragraph where your attention landed."
                },
                {
                  icon: <BookOpen className="text-accent" />,
                  title: "Reflowable PDF",
                  desc: "Extract text from static PDFs and customize fonts, spacing, and colors to match your reading style."
                },
                {
                  icon: <Shield className="text-accent" />,
                  title: "Privacy First",
                  desc: "Your documents stay local. We only sync your progress and notes to the cloud, never your raw files."
                }
              ].map((feature, i) => (
                <div key={i} className="rounded-3xl border border-gray-100 bg-white p-10 shadow-sm transition-all hover:shadow-xl">
                  <div className="mb-6 inline-block rounded-2xl bg-accent/5 p-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-4 leading-relaxed text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[48px] bg-accent p-12 text-white shadow-2xl shadow-accent/20 lg:p-24">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="text-4xl font-black leading-tight sm:text-5xl">
                    Ready to reclaim your focus?
                  </h2>
                  <p className="mt-6 text-xl text-white/90">
                    Join thousands of readers who have swapped eye-strain for deep understanding.
                  </p>
                  <ul className="mt-10 space-y-4">
                    {[
                      "Zero distractions, 100% focus",
                      "Works with any academic PDF",
                      "Cross-device progress syncing",
                      "Free for individual students"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 font-bold">
                        <CheckCircle2 size={24} className="text-white/70" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <Link 
                    href="/auth/signup" 
                    className="w-full max-w-sm rounded-3xl bg-white px-10 py-6 text-center text-2xl font-black text-accent shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    Create Free Account
                  </Link>
                  <p className="mt-6 text-sm font-medium opacity-70 italic text-center">
                    No credit card required. Start reading in 30 seconds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
