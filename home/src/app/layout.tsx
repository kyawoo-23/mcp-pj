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
  title:
    "Comparing Intent-Driven and Interface-Driven Interaction: An Empirical Study of Traditional UI and Conversational AI Using the Model Context Protocol (MCP)",
  description:
    "Experimental platform for the study “Comparing Intent-Driven and Interface-Driven Interaction”, evaluating traditional UIs versus MCP-enabled conversational AI for university course registration and facility booking.",
  verification: {
    google: "ATO72YinSdQAXDsGxKLb-CxHmql8ozFoAVw17NB2RXg",
  },
  icons: {
    icon: [
      {
        url: "/logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
  openGraph: {
    title:
      "Comparing Intent-Driven and Interface-Driven Interaction: An Empirical Study of Traditional UI and Conversational AI Using the Model Context Protocol (MCP)",
    description:
      "Experimental platform and system architecture for comparing traditional graphical user interfaces with MCP-enabled conversational AI for university services.",
    url: "/",
    siteName: "MCP Research",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Comparing Intent-Driven and Interface-Driven Interaction (MCP study)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Comparing Intent-Driven and Interface-Driven Interaction: Traditional UI vs Conversational AI with MCP",
    description:
      "Experimental platform comparing traditional graphical interfaces with MCP-enabled conversational AI for university course registration and facility booking.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
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
