import type { Metadata } from "next";
import AuthProvider from "@/app/components/auth/AuthProvider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Deep Read | Focused Reading & Learning Environment",
  description: "Transform cluttered PDFs into focused, reflowable text. Reclaim your focus with Deep Read, the personal learning environment built for deep comprehension, not just speed.",
  keywords: ["reading", "learning", "PDF reflow", "focus", "education", "research tool", "bionic reading"],
  authors: [{ name: "Deep Read Team" }],
  openGraph: {
    title: "Deep Read | Focused Reading & Learning Environment",
    description: "Read deeper, not faster. The modern sanctuary for your digital library.",
    url: "https://deepread.app",
    siteName: "Deep Read",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Read | Focused Reading & Learning Environment",
    description: "Transform cluttered PDFs into focused, reflowable text.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col transition-theme">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
