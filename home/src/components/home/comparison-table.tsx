import { Check, X, Minus } from "lucide-react";

const comparisons = [
  {
    aspect: "Interaction Method",
    traditional: "Forms & Buttons",
    mcp: "Natural Language",
  },
  {
    aspect: "Navigation",
    traditional: "Multi-page, menu-based",
    mcp: "Single interface",
  },
  {
    aspect: "Learning Curve",
    traditional: "Moderate - UI familiarity needed",
    mcp: "Low - conversational",
  },
  {
    aspect: "Task Completion",
    traditional: "Step-by-step workflow",
    mcp: "Context-aware, adaptive",
  },
  {
    aspect: "User Control",
    traditional: "High - explicit actions",
    mcp: "Moderate - AI-mediated",
  },
  {
    aspect: "Accessibility",
    traditional: "Depends on implementation",
    mcp: "Voice & text friendly",
  },
];

const techStack = {
  traditional: ["Next.js 16", "React 19", "Tailwind CSS", "shadcn/ui", "Supabase"],
  mcp: ["Next.js 16", "MCP SDK", "AI SDK", "Supabase", "TypeScript"],
};

export function ComparisonTable() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4 block">
            Side-by-Side
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Comparison Overview
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Key differences between traditional web portals and MCP-powered 
            conversational interfaces.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto mb-16">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Aspect
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Traditional Portal
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  MCP Chat Agent
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-foreground">
                    {row.aspect}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {row.traditional}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{row.mcp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tech Stack Comparison */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="font-medium mb-4">Traditional Portal Stack</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.traditional.map((tech, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1.5 bg-muted rounded-full text-foreground/80"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <h3 className="font-medium mb-4">MCP Chat Agent Stack</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.mcp.map((tech, index) => (
                <span
                  key={index}
                  className="text-sm px-3 py-1.5 bg-muted rounded-full text-foreground/80"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
