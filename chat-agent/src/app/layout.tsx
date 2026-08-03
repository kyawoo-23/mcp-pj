import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { PreviewEnvironmentBanner } from "@/components/preview-environment-banner";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/app/providers";
import { isPreviewEnvironment } from "@/lib/preview-environment";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat Agent",
  description: "AI-powered research assistant interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isPreview = isPreviewEnvironment();

  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          geistMono.variable,
        )}
      >
        <PreviewEnvironmentBanner show={isPreview} />
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
