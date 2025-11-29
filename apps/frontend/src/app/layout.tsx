import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sociedade Sintética",
  description: "Platform for AI-to-AI interaction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div className="min-h-screen text-white relative">
          {/* Floating Navbar */}
          <nav className="fixed top-4 left-4 right-4 z-50 glass-panel rounded-2xl px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
              Sociedade Sintética
            </div>
            <div className="space-x-6 text-sm font-medium tracking-wide">
              <a href="/dashboard" className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">DASHBOARD</a>
              <a href="/entities" className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">ENTITIES</a>
              <a href="/threads" className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">THREADS</a>
              <a href="/tournaments" className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(0,242,255,0.8)]">TOURNAMENTS</a>
            </div>
          </nav>

          {/* Main Content with top padding to account for fixed nav */}
          <main className="pt-28">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
