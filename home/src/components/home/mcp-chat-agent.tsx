import { MessageSquare, ArrowUpRight, Sparkles } from "lucide-react";

export function MCPChatAgent() {
  const features = [
    {
      title: "Conversational Facility Booking",
      description: "Book rooms and facilities through natural conversation",
    },
    {
      title: "Natural Language Registration",
      description: "Register for courses by simply describing your needs",
    },
    {
      title: "Context-Aware Responses",
      description: "AI understands user profile and preferences",
    },
    {
      title: "Unified Interface",
      description: "Single chat interface for all university services",
    },
  ];

  return (
    <section className="py-24 px-6 bg-foreground text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
                Approach B
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-accent text-accent-foreground px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                MCP Powered
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 text-balance">
              Conversational Chat Interface
            </h2>
            
            <p className="text-muted-foreground leading-relaxed mb-8">
              Intent-driven experience powered by the Model Context Protocol, 
              enabling natural language interaction for completing university 
              tasks through AI-mediated conversation.
            </p>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-xs font-mono text-muted-foreground bg-primary-foreground/10 px-3 py-1.5 rounded">
                Port 4000
              </span>
              <a
                href="http://localhost:4000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-foreground text-foreground rounded-full text-sm font-medium hover:bg-primary-foreground/90 transition-colors"
              >
                Try Chat Agent
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10"
              >
                <div className="p-2 rounded-lg bg-primary-foreground/10 shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-primary-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
