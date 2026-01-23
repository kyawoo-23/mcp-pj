import { Target, HelpCircle, Database } from "lucide-react";

export function ResearchTarget() {
  const questions = [
    "Which approach provides better user experience?",
    "Which is more efficient for completing tasks?",
    "How do users perceive each interface?",
    "Does user-centered design remain essential with AI mediation?",
  ];

  return (
    <section id="research-target" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Column - Objective */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-muted">
                <Target className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                Research Objective
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 text-balance">
              Compare user experience and efficiency between two paradigms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              This research investigates how the Model Context Protocol may reshape 
              conventional interaction models by shifting from interface-driven to 
              intent-driven experiences, examining whether user-centered design 
              remains essential when AI mediates interactions.
            </p>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <Database className="w-5 h-5 text-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">Shared Infrastructure</p>
                <p className="text-sm text-muted-foreground">
                  All prototype systems use the same Supabase backend for fair comparison
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Research Questions */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-muted">
                <HelpCircle className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                Research Questions
              </span>
            </div>
            
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors"
                >
                  <span className="text-4xl font-light text-muted-foreground/50">
                    {index + 1}
                  </span>
                  <p className="text-foreground font-medium pt-2">{question}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
