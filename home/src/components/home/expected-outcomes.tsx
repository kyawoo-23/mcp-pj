import { BarChart3, Cpu, FileText, Users } from "lucide-react";

const outcomes = [
  {
    icon: BarChart3,
    title: "Empirical Comparison",
    description:
      "Controlled comparison of MCP-based conversational interaction and traditional web interfaces.",
  },
  {
    icon: Cpu,
    title: "Prototype System",
    description:
      "A system where you can complete the same tasks through either menus and forms or natural language.",
  },
  {
    icon: FileText,
    title: "Hybrid Design Insights",
    description:
      "How conversational AI and traditional interfaces can coexist—and when each works best.",
  },
  {
    icon: Users,
    title: "SUS, SDT, NASA-TLX",
    description:
      "Usability, perceived autonomy and competence, and cognitive workload.",
  },
];

export function ExpectedOutcomes() {
  return (
    <section className='py-24 px-6 bg-background'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <span className='text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80 mb-4 block'>
            Study Contributions
          </span>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
            Main Contributions
          </h2>
          <p className='text-foreground/90 max-w-2xl mx-auto text-base'>
            Empirical insights into how conversational AI and traditional
            interfaces may coexist in future hybrid interaction environments.
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          {outcomes.map((outcome, index) => (
            <div
              key={index}
              className='group p-8 rounded-xl border-2 border-border bg-card hover:border-foreground/40 transition-all'
            >
              <div className='flex items-start gap-4'>
                <div className='p-3.5 rounded-lg bg-muted group-hover:bg-foreground group-hover:text-primary-foreground transition-colors'>
                  <outcome.icon className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='text-lg md:text-xl font-semibold mb-2'>
                    {outcome.title}
                  </h3>
                  <p className='text-foreground/85 text-base leading-relaxed'>
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
