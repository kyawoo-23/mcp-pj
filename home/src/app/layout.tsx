import React from "react";
import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const _geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mcp-project.app"),
  title: "MCP Research | Traditional Web Portals vs Chat Interfaces",
  description:
    "Research comparing traditional web portals with MCP-powered conversational interfaces for university facility booking and course registration",
  icons: {
    icon: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title: "MCP Research | Traditional Web Portals vs Chat Interfaces",
    description:
      "Research comparing traditional web portals with MCP-powered conversational interfaces for university facility booking and course registration",
    url: "/",
    siteName: "MCP Research",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MCP Research",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP Research | Traditional Web Portals vs Chat Interfaces",
    description:
      "Research comparing traditional web portals with MCP-powered conversational interfaces for university facility booking and course registration",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          outfit.variable,
          _geistMono.variable,
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
            <Analytics />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
