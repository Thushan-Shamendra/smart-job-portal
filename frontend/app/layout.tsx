import "./globals.css";

import type { Metadata } from "next";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
