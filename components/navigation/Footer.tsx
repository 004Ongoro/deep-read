"use client";

import { useSession } from "next-auth/react";

export default function Footer() {
  const { status } = useSession();
  
  // Minimal footer for logged-in users to maximize focus
  if (status === "authenticated") {
    return (
      <footer className="border-t bg-white py-4 text-center text-[10px] uppercase tracking-widest text-gray-500">
        &copy; {new Date().getFullYear()} Deep Read — Focused Learning Protocol Active.
      </footer>
    );
  }

  return (
    <footer className="bg-gray-50 border-t py-12">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500">
          Built for the focused reader. Open Source & Privacy First.
        </p>
      </div>
    </footer>
  );
}