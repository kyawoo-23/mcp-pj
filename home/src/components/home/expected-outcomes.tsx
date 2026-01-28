import { BarChart3, Cpu, FileText, Users } from "lucide-react";

const outcomes = [
  {
    icon: BarChart3,
    title: "Real User Feedback",
    description:
      "Understanding which approach people prefer and which helps them complete tasks more easily.",
  },
  {
    icon: Cpu,
    title: "Working Examples",
    description:
      "Both approaches are fully functional, so you can try them out and see which feels better to you.",
  },
  {
    icon: FileText,
    title: "Better Design Guidelines",
    description:
      "Learning what makes AI chat assistants helpful and when traditional websites might work better.",
  },
  {
    icon: Users,
    title: "Help Shape the Future",
    description:
      "Your participation helps us understand how people want to interact with websites and AI assistants.",
  },
];

export function ExpectedOutcomes() {
  return (
    <section className='py-24 px-6 bg-background'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <span className='text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80 mb-4 block'>
            What We Hope to Learn
          </span>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
            What This Study Will Tell Us
          </h2>
          <p className='text-foreground/90 max-w-2xl mx-auto text-base'>
            By comparing these two approaches, we hope to understand which way
            of using websites feels better and helps people get things done more
            easily.
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
