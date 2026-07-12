import "./globals.css";

import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "JobPilot",
  description:
    "JobPilot is a full stack smart job portal built with Next.js, TypeScript, Node.js, Express, and MongoDB.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full bg-[var(--page-background)] text-slate-900">
        <div className="relative flex min-h-full flex-col">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.16),transparent_56%)]" />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
