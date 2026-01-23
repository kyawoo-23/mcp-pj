import { BarChart3, Cpu, FileText, Users } from "lucide-react";

const outcomes = [
  {
    icon: BarChart3,
    title: "User Experience Evaluation",
    description:
      "Empirical data comparing user performance, satisfaction, and control between conversational AI and traditional interfaces.",
  },
  {
    icon: Cpu,
    title: "Functional Prototype",
    description:
      "A working system integrating MCP demonstrating real-world intent-based interactions as proof of concept.",
  },
  {
    icon: FileText,
    title: "Design Framework",
    description:
      "Guidelines for designing context-aware, conversational, and AI-integrated user experiences in MCP-driven environments.",
  },
  {
    icon: Users,
    title: "Research Contribution",
    description:
      "Insights into HCI and AI integration, providing foundation for future research on human–AI collaboration.",
  },
];

export function ExpectedOutcomes() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4 block">
            Research Goals
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Expected Outcomes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This research aims to contribute both practical prototypes and 
            theoretical frameworks for the future of adaptive interaction design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {outcomes.map((outcome, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-muted group-hover:bg-foreground group-hover:text-primary-foreground transition-colors">
                  <outcome.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{outcome.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {outcome.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
