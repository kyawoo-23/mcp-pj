import { HeroSection } from "@/components/home/hero-section";
import { ResearchTarget } from "@/components/home/research-target";
import { TraditionalPortals } from "@/components/home/traditional-portals";
import { MCPChatAgent } from "@/components/home/mcp-chat-agent";
import { ComparisonTable } from "@/components/home/comparison-table";
import { WorkflowDiagram } from "@/components/home/workflow-diagram";
import { TechStack } from "@/components/home/tech-stack";
import { ExpectedOutcomes } from "@/components/home/expected-outcomes";
import { Footer } from "@/components/home/footer";

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
      <ExpectedOutcomes />
      <Footer />
    </main>
  );
}
