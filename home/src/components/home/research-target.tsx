import { Target, HelpCircle, Database } from "lucide-react";

export function ResearchTarget() {
  const questions = [
    "Which way feels easier to use?",
    "Which helps you get things done faster?",
    "Which do you prefer overall?",
    "How does chatting with AI compare to clicking through forms?",
  ];

  return (
    <section id="research-target" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Objective */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-muted">
                <Target className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80">
                What We're Studying
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 text-balance">
              Comparing two ways to use websites
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-8 text-base">
              We want to understand which approach works better: traditional websites 
              where you click through pages and fill out forms, or chatting with an AI 
              assistant that helps you get things done through conversation.
            </p>
            
            <div className="flex items-start gap-3 p-5 rounded-lg bg-muted/50 border-2 border-border">
              <Database className="w-6 h-6 text-accent-foreground mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-base mb-1.5">Fair Comparison</p>
                <p className="text-base text-foreground/85">
                  Both approaches use the same systems behind the scenes, so we can 
                  fairly compare how they feel to use.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Research Questions */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-muted">
                <HelpCircle className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80">
                What We Want to Know
              </span>
            </div>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 rounded-lg border-2 border-border bg-card hover:border-foreground/40 transition-colors"
                >
                  <span className="text-4xl font-semibold text-foreground/70">
                    {index + 1}
                  </span>
                  <p className="text-foreground font-semibold pt-2 text-base">{question}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
