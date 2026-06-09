import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { PreviewEnvironmentBanner } from "@/components/preview-environment-banner";
import { TaskIndicator } from "@/components/tasks/task-indicator";
import { Toaster } from "@/components/ui/sonner";
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
  title: "Uni Booking - University Facility Booking System",
  description: "Book and manage university facilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isPreview = isPreviewEnvironment();

  return (
    <html lang='en'>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <PreviewEnvironmentBanner show={isPreview} />
        <AuthProvider>
          <div className='flex min-h-screen flex-col'>
            <Navbar />
            <main className='flex-1'>{children}</main>
            <TaskIndicator />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
