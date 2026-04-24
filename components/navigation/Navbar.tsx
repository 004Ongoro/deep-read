"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = session 
    ? [{ name: "Dashboard", href: "/" }, { name: "My Library", href: "/library" }]
    : [{ name: "Features", href: "#features" }, { name: "About", href: "#about" }];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-theme">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Image src="/logo.svg" alt="Deep Read" width={140} height={40} priority className="dark:invert" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
              {link.name}
            </Link>
          ))}
          
          {status === "authenticated" ? (
            <div className="flex items-center gap-4 border-l border-border pl-8">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{session.user?.name}</span>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/auth/signin" className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-accent-foreground shadow-lg shadow-accent/20 hover:opacity-90 transition-all active:scale-95">
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-6 pt-2 space-y-4">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="block text-lg font-medium text-foreground">
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-border">
            {status === "authenticated" ? (
              <button onClick={() => signOut()} className="w-full text-left text-red-500 font-bold">Logout</button>
            ) : (
              <Link href="/auth/signin" className="block w-full text-center rounded-lg bg-accent py-3 text-accent-foreground font-bold">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}