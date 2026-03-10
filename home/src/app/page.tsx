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
  title:
    "Comparing Intent-Driven and Interface-Driven Interaction: Traditional UI vs Conversational AI with MCP",
  description:
    "Participate in the user study behind “Comparing Intent-Driven and Interface-Driven Interaction”, evaluating traditional graphical user interfaces versus MCP-enabled conversational AI for university facility booking and course registration.",
  keywords: [
    "Comparing Intent-Driven and Interface-Driven Interaction",
    "Traditional UI vs Conversational AI",
    "Model Context Protocol",
    "MCP conversational interface",
    "intent-driven interaction",
    "interface-driven interaction",
    "user experience research",
    "human-computer interaction",
    "facility booking",
    "course registration",
    "UX study",
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
    title:
      "Comparing Intent-Driven and Interface-Driven Interaction: Traditional UI vs Conversational AI with MCP",
    description:
      "Landing page for the user study comparing traditional graphical interfaces with MCP-enabled conversational AI for university tasks.",
    url: "/",
    siteName: "Research Study",
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
      "Participate in the user study comparing traditional graphical interfaces with MCP-enabled conversational AI for university services.",
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
