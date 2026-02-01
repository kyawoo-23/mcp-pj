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
  title: "MCP Research | Traditional Web Portals vs Chat Interfaces",
  description:
    "Research comparing traditional web portals with MCP-powered conversational interfaces for university facility booking and course registration",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
