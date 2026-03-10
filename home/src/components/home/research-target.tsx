import { Target, HelpCircle, Database } from "lucide-react";

export function ResearchTarget() {
  const questions = [
    "Which made you feel more in control?",
    "Where was it clearer what the system did on your behalf?",
    "Which behaved more predictably?",
    "Which would you trust more without close supervision?",
    "Which would you prefer depending on the task?",
  ];

  return (
    <section id='research-target' className='py-24 px-6 bg-background'>
      <div className='max-w-6xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-16'>
          {/* Left Column - Objective */}
          <div>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 rounded-lg bg-muted'>
                <Target className='w-6 h-6 text-foreground' />
              </div>
              <span className='text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80'>
                What We&apos;re Studying
              </span>
            </div>
            <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-6 text-balance'>
              Empirical comparison of interaction modalities
            </h2>
            <p className='text-foreground/90 leading-relaxed mb-6 text-base text-justify'>
              We compare a traditional web interface (menus, forms, buttons)
              with an MCP-based conversational system. Both handle the same four
              tasks—register or drop a course, book or cancel a facility
              room—and share the same backend, so any differences come from how
              you interact, not what the system can do.
            </p>
            <div className='flex items-start gap-3 p-5 rounded-lg bg-muted/50 border-2 border-border'>
              <Database className='w-6 h-6 text-accent-foreground mt-0.5 shrink-0' />
              <div>
                <p className='font-semibold text-base mb-1.5'>
                  Functional Equivalence
                </p>
                <p className='text-base text-foreground/85'>
                  Shared backend, differences arise from modality, not
                  functionality.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Research Questions */}
          <div>
            <div className='flex items-center gap-3 mb-6'>
              <div className='p-2.5 rounded-lg bg-muted'>
                <HelpCircle className='w-6 h-6 text-foreground' />
              </div>
              <span className='text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80'>
                Preference Questions
              </span>
            </div>

            <div className='space-y-4'>
              {questions.map((question, index) => (
                <div
                  key={index}
                  className='flex items-start gap-4 p-6 rounded-lg border-2 border-border bg-card hover:border-foreground/40 transition-colors'
                >
                  <span className='text-4xl font-semibold text-foreground/70'>
                    {index + 1}
                  </span>
                  <p className='text-foreground font-semibold pt-2 text-base'>
                    {question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
