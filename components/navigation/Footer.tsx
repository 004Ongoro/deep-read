"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Globe, MessageSquare, Share2, Mail } from "lucide-react";

export default function Footer() {
  const { status } = useSession();
  
  // Minimal footer for logged-in users to maximize focus
  if (status === "authenticated") {
    return (
      <footer className="border-t border-border bg-background py-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground transition-theme">
        &copy; {new Date().getFullYear()} Deep Read — Focused Learning Protocol Active.
      </footer>
    );
  }

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Methodology", href: "#methodology" },
        { name: "Pricing", href: "#pricing" },
        { name: "Changelog", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Help Center", href: "#" },
        { name: "Community", href: "#" },
        { name: "Privacy Policy", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Terms", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-muted/30 border-t border-border pt-20 pb-10 transition-theme">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Deep Read" width={140} height={40} />
            </Link>
            <p className="mt-6 max-w-xs text-base text-muted-foreground leading-relaxed">
              Transforming static PDFs into focused learning environments. 
              Built for the modern researcher who values depth over speed.
            </p>
            <div className="mt-8 flex gap-5">
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Globe size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Share2 size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <MessageSquare size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Mail size={20} />
              </Link>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {section.title}
              </h3>
              <ul className="mt-6 space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-base text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-20 border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Deep Read Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              All systems functional
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}