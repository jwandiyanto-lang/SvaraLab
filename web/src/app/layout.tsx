import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SvaraLab - English Speaking Practice",
  description: "Master English speaking with AI-powered practice for Indonesian students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <Navigation userName="Learner" streak={5} />
        {/* Main content wrapper */}
        <main className="lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
