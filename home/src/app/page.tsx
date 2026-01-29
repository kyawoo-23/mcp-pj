import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { SurveyCTA } from "@/components/home/survey-cta";
import { ResearchTarget } from "@/components/home/research-target";
import { TraditionalPortals } from "@/components/home/traditional-portals";
import { MCPChatAgent } from "@/components/home/mcp-chat-agent";
import { ComparisonTable } from "@/components/home/comparison-table";
import { WorkflowDiagram } from "@/components/home/workflow-diagram";
import { TechStack } from "@/components/home/tech-stack";
import { ExpectedOutcomes } from "@/components/home/expected-outcomes";
import { Footer } from "@/components/home/footer";

export const metadata: Metadata = {
  title: "Research | Traditional Web Portals vs AI Chat Assistants",
  description:
    "Participate in our user experience research study comparing traditional web portals with conversational AI interfaces for university facility booking and course registration. Help us understand which approach works better.",
  keywords: [
    "user experience research",
    "AI chat interface",
    "conversational AI",
    "university portal",
    "facility booking",
    "course registration",
    "UX study",
    "human-computer interaction",
  ],
  authors: [{ name: "Kyaw Kyaw Oo" }],
  creator: "Kyaw Kyaw Oo",
  publisher: "Kyaw Kyaw Oo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Research | Traditional Web Portals vs AI Chat Assistants",
    description:
      "Participate in our user experience research study comparing traditional web portals with AI chat assistants for university tasks.",
    url: "/",
    siteName: "Research Study",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Research - Traditional Web Portals vs AI Chat Assistants",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research | Traditional Web Portals vs AI Chat Assistants",
    description:
      "Participate in our user experience research study comparing traditional web portals with AI chat assistants.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ResearchTarget />
      <TraditionalPortals />
      <MCPChatAgent />
      <ComparisonTable />
      <WorkflowDiagram />
      <TechStack />
      <SurveyCTA />
      <ExpectedOutcomes />
      <Footer />
    </main>
  );
}
