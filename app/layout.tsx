export const dynamic = 'force-dynamic'
export const runtime = 'edge'

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Smart Notes | Secure, AI-Powered Intelligence System",
  description: "Experience the next generation of knowledge management. Secure, encrypted, and pre-indexed for AI-readability. MINI GITHUB logic for your personal and community notes.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.webp",
    apple: "/favicon.webp",
  },
  alternates: {
    canonical: "https://notes.biz.id",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
