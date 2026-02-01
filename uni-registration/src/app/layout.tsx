import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { TaskIndicator } from "@/components/tasks/task-indicator";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uni Registration - University Course Registration System",
  description: "Register and manage university courses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
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
