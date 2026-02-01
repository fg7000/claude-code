import type { Metadata } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VoiceWidget } from "@/components/voice/VoiceWidget";

export const metadata: Metadata = {
  title: "Agencer - Every AI. Every tool. One voice.",
  description: "Agencer orchestrates every AI model and every tool through one voice interface. Tell it what you need. Walk away.",
  openGraph: {
    title: "Agencer - Every AI. Every tool. One voice.",
    description: "Agencer orchestrates every AI model and every tool through one voice interface. Tell it what you need. Walk away.",
    type: "website",
    locale: "en_US",
    url: "https://agencer.ai",
    siteName: "Agencer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agencer - Every AI. Every tool. One voice.",
    description: "Agencer orchestrates every AI model and every tool through one voice interface. Tell it what you need. Walk away.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=JetBrains+Mono:wght@400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SmoothScrollProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
          <VoiceWidget />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
