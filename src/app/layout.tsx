import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CBC Assessment Translation Hub",
  description: "Empowering Kenyan teachers and parents through AI-driven assessment translations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
