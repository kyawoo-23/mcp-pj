import { MessageSquare, ArrowUpRight, Sparkles } from "lucide-react";
import { getChatAgentBaseUrl } from "@/utils/constants";

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
      title: "Smart Understanding",
      description: "The AI remembers your information and preferences",
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
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/20 border-2 border-purple-500/40 rounded-full">
                <span className="text-lg md:text-xl font-bold tracking-wide uppercase text-purple-300">
                  Approach B
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent text-accent-foreground px-3 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4" />
                AI Powered
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 text-balance">
              Chat with an AI Assistant
            </h2>
            
            <p className="text-primary-foreground/90 leading-relaxed mb-8 text-base">
              Instead of clicking through pages, just tell the AI what you need. 
              It understands your request and helps you complete tasks through 
              natural conversation.
            </p>

            <div className="flex items-center gap-4 mb-8">
              <a
                href={getChatAgentBaseUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-foreground text-foreground rounded-full text-base font-semibold hover:bg-primary-foreground/90 transition-colors shadow-md"
              >
                Try Chat Agent
                <ArrowUpRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-primary-foreground/10 border-2 border-primary-foreground/20"
              >
                <div className="p-2.5 rounded-lg bg-primary-foreground/20 shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-base text-primary-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-base text-primary-foreground/85">
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
