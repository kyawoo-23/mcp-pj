import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/hero-section";
import { ScrollToTopClient } from "@/components/home/scroll-to-top-client";

// Lazy load below-the-fold components for better initial load performance
const ResearchAnalysis = dynamic(
  () => import("@/components/home/research-analysis").then((m) => m.ResearchAnalysis),
  { ssr: true }
);
const ResearchTarget = dynamic(
  () => import("@/components/home/research-target").then((m) => m.ResearchTarget),
  { ssr: true }
);
const TraditionalPortals = dynamic(
  () => import("@/components/home/traditional-portals").then((m) => m.TraditionalPortals),
  { ssr: true }
);
const MCPChatAgent = dynamic(
  () => import("@/components/home/mcp-chat-agent").then((m) => m.MCPChatAgent),
  { ssr: true }
);
const ComparisonTable = dynamic(
  () => import("@/components/home/comparison-table").then((m) => m.ComparisonTable),
  { ssr: true }
);
const WorkflowDiagram = dynamic(
  () => import("@/components/home/workflow-diagram").then((m) => m.WorkflowDiagram),
  { ssr: true }
);
const TechStack = dynamic(
  () => import("@/components/home/tech-stack").then((m) => m.TechStack),
  { ssr: true }
);
const SurveyCTA = dynamic(
  () => import("@/components/home/survey-cta").then((m) => m.SurveyCTA),
  { ssr: true }
);
const ExpectedOutcomes = dynamic(
  () => import("@/components/home/expected-outcomes").then((m) => m.ExpectedOutcomes),
  { ssr: true }
);
const Footer = dynamic(
  () => import("@/components/home/footer").then((m) => m.Footer),
  { ssr: true }
);

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
      <ResearchAnalysis />
      <ResearchTarget />
      <TraditionalPortals />
      <MCPChatAgent />
      <ComparisonTable />
      <WorkflowDiagram />
      <TechStack />
      <SurveyCTA />
      <ExpectedOutcomes />
      <Footer />
      <ScrollToTopClient />
    </main>
  );
}
