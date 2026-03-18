import { MessageSquare, ArrowUpRight, Sparkles } from "lucide-react";
import { getChatAgentBaseUrl } from "@/utils/constants";

export function MCPChatAgent() {
  const features = [
    {
      title: "Intent-Driven",
      description: "Natural language requests are turned into MCP tool calls",
    },
    {
      title: "Facility Booking",
      description: "Book or cancel rooms by describing what you need",
    },
    {
      title: "Course Registration",
      description: "Register or drop courses by expressing your intent",
    },
    {
      title: "Shared Backend",
      description: "Same database as the traditional interface",
    },
  ];

  return (
    <section className='py-16 md:py-24 px-4 sm:px-6 bg-foreground text-primary-foreground'>
      <div className='max-w-6xl mx-auto'>
        <div className='grid lg:grid-cols-2 gap-10 md:gap-16 items-center'>
          {/* Left Column - Content */}
          <div>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3 mb-6'>
              <div className='inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-500/20 border-2 border-purple-500/40 rounded-full self-start sm:self-auto order-2 sm:order-1'>
                <span className='text-lg md:text-xl font-bold tracking-wide uppercase text-purple-300'>
                  MCP Conversational System
                </span>
              </div>
              <span className='inline-flex items-center gap-1.5 text-xs font-semibold bg-accent text-accent-foreground px-3 py-1.5 rounded-full self-start sm:self-auto order-1 sm:order-2'>
                <Sparkles className='w-4 h-4' />
                AI Powered
              </span>
            </div>

            <h2 className='text-3xl md:text-4xl font-bold tracking-tight mb-4 md:mb-6 text-balance'>
              Express Intent in Natural Language
            </h2>

            <p className='text-primary-foreground/90 leading-relaxed mb-6 md:mb-8 text-base text-balance'>
              Say what you need—e.g., &quot;Book a study room tomorrow at 2
              PM&quot;—and the system interprets your request and carries it out
              via MCP. No menus or forms to navigate.
            </p>

            <div className='flex items-center gap-4 mb-6 md:mb-8'>
              <a
                href={getChatAgentBaseUrl()}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary-foreground text-foreground rounded-full text-base font-semibold hover:bg-primary-foreground/90 transition-colors shadow-md'
              >
                Try Chat Agent
                <ArrowUpRight className='w-4 sm:w-5 h-4 sm:h-5' />
              </a>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className='space-y-3 md:space-y-4'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-primary-foreground/10 border-2 border-primary-foreground/20'
              >
                <div className='p-2 sm:p-2.5 rounded-lg bg-primary-foreground/20 shrink-0'>
                  <MessageSquare className='w-5 sm:w-6 h-5 sm:h-6 text-primary-foreground' />
                </div>
                <div className='min-w-0'>
                  <h3 className='font-semibold mb-1 sm:mb-2 text-base text-primary-foreground'>
                    {feature.title}
                  </h3>
                  <p className='text-base text-primary-foreground/85'>
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
