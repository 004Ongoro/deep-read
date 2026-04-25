"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  BookOpen, Zap, Shield, ArrowRight, CheckCircle2, 
  Layers, MousePointer2, Sparkles, Smartphone, 
  Cloud, MessageCircle, HelpCircle, User
} from "lucide-react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-accent/10 selection:text-accent transition-theme">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 pt-24 pb-32 sm:px-6 lg:px-8 lg:pt-40 lg:pb-48">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent-muted px-4 py-1.5 text-sm font-bold text-accent">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                  </span>
                  Reclaiming the Flow State
                </div>
                <h1 className="mt-8 text-6xl font-black tracking-tight text-foreground sm:text-8xl">
                  Read deeper, <br />
                  <span className="text-accent italic">not faster.</span>
                </h1>
                <p className="mt-8 max-w-lg mx-auto lg:mx-0 text-xl leading-relaxed text-muted-foreground">
                  The personal learning environment that transforms cluttered PDFs into 
                  focused, reflowable text. No distractions. No lost progress. Just you and the material.
                </p>
                <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link 
                    href="/auth/signup" 
                    className="flex items-center justify-center gap-2 rounded-2xl bg-accent px-10 py-5 text-xl font-black text-accent-foreground shadow-2xl shadow-accent/20 transition-all hover:scale-105 active:scale-95"
                  >
                    Start Reading Free <ArrowRight size={20} />
                  </Link>
                  <Link 
                    href="#features" 
                    className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-10 py-5 text-xl font-bold text-muted-foreground transition-all hover:border-accent hover:text-accent"
                  >
                    Explore Features
                  </Link>
                </div>
                <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden ring-1 ring-border">
                        <User size={20} className="text-muted-foreground/50" />
                      </div>
                    ))}
                  </div>
                  <span className="font-medium">Joined by 1,200+ active learners</span>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-10 rounded-[60px] bg-accent/10 blur-3xl" />
                <div className="relative overflow-hidden rounded-[40px] border border-border bg-card p-4 shadow-2xl transition-theme">
                  <div className="aspect-video w-full rounded-[28px] bg-muted flex items-center justify-center overflow-hidden">
                     <Image 
                      src="/login.svg" 
                      alt="Deep Read Interface" 
                      width={800} 
                      height={500}
                      className="object-cover"
                    />
                  </div>
                </div>
                
                {/* Floating UI elements */}
                <div className="absolute -bottom-10 -left-10 hidden xl:block w-64 rounded-3xl border border-border bg-card p-6 shadow-2xl animate-bounce-slow">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="h-3 w-3 rounded-full bg-green-500" />
                     <span className="text-sm font-bold">Focus Mode Active</span>
                   </div>
                   <div className="space-y-2">
                     <div className="h-2 w-full rounded-full bg-muted" />
                     <div className="h-2 w-3/4 rounded-full bg-muted" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="bg-muted/30 py-32 border-y border-border transition-theme">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent mb-6">The Modern Struggle</h2>
            <p className="text-3xl font-bold leading-tight sm:text-4xl text-foreground italic">
              "PDFs weren't designed for reading; they were designed for printing. 
              On modern screens, they are static, rigid, and exhausting."
            </p>
            <p className="mt-8 text-lg text-muted-foreground">
              Deep Read breaks the cage of the fixed-layout document, giving you the flexibility of an e-reader 
              with the power of a professional research tool.
            </p>
          </div>
        </section>

        {/* Methodology / Features Grid */}
        <section id="features" className="py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h2 className="text-lg font-bold uppercase tracking-widest text-accent">The Core Engine</h2>
              <p className="mt-4 text-4xl font-black text-foreground sm:text-5xl">Built for cognitive endurance.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Layers size={32} className="text-accent" />,
                  title: "Reflowable Layout",
                  desc: "Strip away double columns, sidebars, and tiny fonts. We extract the core text and re-render it in a beautiful, responsive interface."
                },
                {
                  icon: <Zap size={32} className="text-accent" />,
                  title: "Bionic Reading",
                  desc: "Optionally highlight the beginning of words to guide your eyes through the text faster while maintaining deep comprehension."
                },
                {
                  icon: <MousePointer2 size={32} className="text-accent" />,
                  title: "Semantic Anchoring",
                  desc: "Close the tab anytime. We remember exactly which paragraph you were reading, not just which page."
                },
                {
                  icon: <Sparkles size={32} className="text-accent" />,
                  title: "Typography Control",
                  desc: "Adjust font size, line height, and themes (Light, Dark, Sepia) to match your environment and reduce eye strain."
                },
                {
                  icon: <Shield size={32} className="text-accent" />,
                  title: "Privacy First",
                  desc: "Your research is yours. We process documents in your browser and only sync minimal progress data to our servers."
                },
                {
                  icon: <Cloud size={32} className="text-accent" />,
                  title: "Library Sync",
                  desc: "Upload once, read everywhere. Your library and progress are available across all your devices seamlessly."
                }
              ].map((feature, i) => (
                <div key={i} className="group rounded-[32px] border border-border bg-card p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1">
                  <div className="mb-8 inline-block rounded-2xl bg-accent-muted p-5 transition-transform group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="bg-muted/30 py-32 border-y border-border transition-theme">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="flex-1 space-y-10">
                <h2 className="text-4xl font-black text-foreground">A three-step path to <span className="text-accent underline decoration-4 underline-offset-8">enlightenment.</span></h2>
                
                <div className="space-y-12">
                  {[
                    { step: "01", title: "Ingest", desc: "Upload your PDF or research paper. Our parser identifies the core narrative and strips the clutter." },
                    { step: "02", title: "Personalize", desc: "Choose your font, size, and theme. Activate Bionic mode for dense academic material." },
                    { step: "03", title: "Absorb", desc: "Read without distractions. Use our semantic progress tracker to pick up exactly where you left off." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <span className="text-4xl font-black text-accent/20">{item.step}</span>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-lg">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 relative w-full aspect-square max-w-lg">
                <div className="absolute inset-0 bg-accent rounded-full opacity-5 blur-3xl" />
                <div className="relative h-full w-full rounded-[48px] border-8 border-card bg-muted shadow-2xl overflow-hidden">
                   <div className="p-8 h-full flex flex-col justify-center gap-6">
                      <div className="h-4 w-3/4 rounded-full bg-accent/20" />
                      <div className="h-4 w-full rounded-full bg-accent/20" />
                      <div className="h-4 w-2/3 rounded-full bg-accent/20" />
                      <div className="h-4 w-5/6 rounded-full bg-accent/20" />
                      <div className="h-4 w-full rounded-full bg-accent/20" />
                      <div className="h-4 w-4/5 rounded-full bg-accent/20" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Personas / Use Cases */}
        <section className="py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-20">
              <h2 className="text-lg font-bold uppercase tracking-widest text-accent">Who is it for?</h2>
              <p className="mt-4 text-4xl font-black text-foreground">Tailored for the curious.</p>
            </div>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
               {[
                 {
                   title: "Students",
                   useCase: "Crush your reading list without the burnout. Transform textbook chapters into manageable, readable text.",
                   benefit: "Save 40% more time on weekly readings."
                 },
                 {
                   title: "Researchers",
                   useCase: "Focus on the data, not the scrolling. Our semantic anchoring makes jumping between references and text seamless.",
                   benefit: "Maintain flow during complex analysis."
                 },
                 {
                   title: "Professionals",
                   useCase: "Stay updated with industry whitepapers on the go. Mobile-optimized reading for your commute.",
                   benefit: "Never lose your place again."
                 }
               ].map((item, i) => (
                 <div key={i} className="flex flex-col rounded-3xl border border-border bg-card p-10 transition-theme hover:border-accent/30">
                    <h3 className="text-2xl font-black text-foreground mb-4">{item.title}</h3>
                    <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{item.useCase}</p>
                    <div className="mt-auto pt-6 border-t border-border">
                       <p className="text-sm font-bold text-accent uppercase tracking-wider">{item.benefit}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 bg-muted/20 border-t border-border transition-theme">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-4xl font-black text-center mb-16">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "How is this different from a normal PDF reader?", a: "Most readers just show you the image of the page. We extract the text, clean it, and re-render it to fit your screen and your eyes perfectly." },
                { q: "Does it work with scanned PDFs?", a: "Currently, we work best with digital-first PDFs. Scanned documents require OCR which we are rolling out in our Pro version soon." },
                { q: "Is my data secure?", a: "Absolutely. We don't even store your raw files. They live in your browser's local storage (IndexedDB). We only sync progress hashes." },
                { q: "Can I use it on my phone?", a: "Yes! Deep Read is a progressive web app. It's designed to be just as beautiful and functional on a 6-inch screen as it is on a 27-inch monitor." }
              ].map((faq, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-8">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <HelpCircle size={20} className="text-accent" /> {faq.q}
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Final CTA */}
        <section className="py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-[64px] bg-accent p-12 text-accent-foreground shadow-2xl shadow-accent/20 lg:p-24 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
              
              <div className="relative grid gap-16 lg:grid-cols-2 lg:items-center">
                <div className="text-center lg:text-left">
                  <h2 className="text-5xl font-black leading-tight sm:text-7xl">
                    Ready to reclaim <br /> your focus?
                  </h2>
                  <p className="mt-8 text-2xl text-accent-foreground/90">
                    Join the movement towards deep understanding. Free forever for individuals.
                  </p>
                  <ul className="mt-12 space-y-6">
                    {[
                      "Zero distractions, 100% focus",
                      "Works with any academic PDF",
                      "Cross-device progress syncing",
                      "Privacy-first architecture"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center justify-center lg:justify-start gap-4 text-xl font-bold">
                        <CheckCircle2 size={28} className="text-accent-foreground/60" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-center">
                  <Link 
                    href="/auth/signup" 
                    className="w-full max-w-md rounded-[32px] bg-white px-12 py-8 text-center text-3xl font-black text-accent shadow-2xl transition-all hover:scale-105 hover:rotate-1 active:scale-95"
                  >
                    Start Reading Now
                  </Link>
                  <p className="mt-8 text-lg font-bold italic opacity-80 flex items-center gap-2">
                    <MessageCircle size={24} /> &quot;The best tool for my PhD research.&quot;
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
} );
}