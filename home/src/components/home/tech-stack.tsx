import { Server, Layers, GitBranch, Database } from "lucide-react";

export function TechStack() {
  return (
    <section className='py-24 px-6 bg-background'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <span className='text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80 mb-4 block'>
            Behind the Scenes
          </span>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
            System Design
          </h2>
          <p className='text-foreground/90 max-w-2xl mx-auto text-base'>
            Two web applications and a conversational agent share one backend. The
            same database powers both interaction paths, so we can compare how
            modality affects experience—not functionality.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className='bg-card rounded-xl border-2 border-border p-8 mb-12'>
          <div className='grid md:grid-cols-3 gap-8'>
            {/* Frontend Layer */}
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4'>
                <Layers className='w-7 h-7 text-foreground' />
              </div>
              <h3 className='font-semibold mb-3 text-base'>Interaction</h3>
              <div className='space-y-2.5 text-base text-foreground/85'>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Facility Booking
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Course Registration
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Chat Agent
                </p>
              </div>
            </div>

            {/* API Layer */}
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4'>
                <Server className='w-7 h-7 text-foreground' />
              </div>
              <h3 className='font-semibold mb-3 text-base'>Service</h3>
              <div className='space-y-2.5 text-base text-foreground/85'>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  REST / GraphQL
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  MCP Tool Invocation
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Backend
                </p>
              </div>
            </div>

            {/* Data Layer */}
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4'>
                <Database className='w-7 h-7 text-foreground' />
              </div>
              <h3 className='font-semibold mb-3 text-base'>Data</h3>
              <div className='space-y-2.5 text-base text-foreground/85'>
                <p className='p-2.5 bg-accent/10 border-2 border-accent/30 rounded text-accent-foreground font-semibold'>
                  Shared Database
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Task Time & Progress
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Survey & Logs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className='grid md:grid-cols-3 gap-6'>
          <div className='p-6 rounded-xl bg-card border-2 border-border'>
            <GitBranch className='w-6 h-6 text-foreground mb-3' />
            <h3 className='font-semibold mb-2 text-base'>Functional Equivalence</h3>
            <p className='text-base text-foreground/85'>
              Same backend; differences come from modality, not functionality.
            </p>
          </div>
          <div className='p-6 rounded-xl bg-card border-2 border-border'>
            <Database className='w-6 h-6 text-foreground mb-3' />
            <h3 className='font-semibold mb-2 text-base'>Unified Analytics</h3>
            <p className='text-base text-foreground/85'>
              We record task time, progress, interaction logs, and survey
              responses so we can compare both systems directly.
            </p>
          </div>
          <div className='p-6 rounded-xl bg-card border-2 border-border'>
            <Server className='w-6 h-6 text-foreground mb-3' />
            <h3 className='font-semibold mb-2 text-base'>
              Experimental Platform
            </h3>
            <p className='text-base text-foreground/85'>
              Open-source prototype. Within-subject design with counterbalanced
              order.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
