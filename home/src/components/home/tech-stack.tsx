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
            How We Built This
          </h2>
          <p className='text-foreground/90 max-w-2xl mx-auto text-base'>
            Both approaches use the same underlying systems, so any differences
            you experience come from how you interact with them, not from
            technical differences.
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
              <h3 className='font-semibold mb-3 text-base'>What You See</h3>
              <div className='space-y-2.5 text-base text-foreground/85'>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Booking Website
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Registration Website
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  AI Chat Assistant
                </p>
              </div>
            </div>

            {/* API Layer */}
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4'>
                <Server className='w-7 h-7 text-foreground' />
              </div>
              <h3 className='font-semibold mb-3 text-base'>How They Work</h3>
              <div className='space-y-2.5 text-base text-foreground/85'>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Website Functions
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  AI Assistant Tools
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Shared Services
                </p>
              </div>
            </div>

            {/* Data Layer */}
            <div className='text-center'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4'>
                <Database className='w-7 h-7 text-foreground' />
              </div>
              <h3 className='font-semibold mb-3 text-base'>Where Data Lives</h3>
              <div className='space-y-2.5 text-base text-foreground/85'>
                <p className='p-2.5 bg-accent/10 border-2 border-accent/30 rounded text-accent-foreground font-semibold'>
                  Shared Database
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Your Information
                </p>
                <p className='p-2.5 bg-muted rounded font-medium'>
                  Secure Storage
                </p>
              </div>
            </div>
          </div>

          {/* Connection Lines (visual representation) */}
          <div className='hidden md:flex justify-center items-center gap-4 mt-8 pt-8 border-t-2 border-border'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full bg-foreground/40' />
              <span className='text-base font-medium text-foreground/80'>
                Data Flow
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 rounded-full bg-accent' />
              <span className='text-base font-medium text-foreground/80'>
                Shared Resource
              </span>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className='grid md:grid-cols-3 gap-6'>
          <div className='p-6 rounded-xl bg-card border-2 border-border'>
            <GitBranch className='w-6 h-6 text-foreground mb-3' />
            <h3 className='font-semibold mb-2 text-base'>Fair Testing</h3>
            <p className='text-base text-foreground/85'>
              Both approaches are built separately but use the same data, so we
              can compare them fairly.
            </p>
          </div>
          <div className='p-6 rounded-xl bg-card border-2 border-border'>
            <Database className='w-6 h-6 text-foreground mb-3' />
            <h3 className='font-semibold mb-2 text-base'>Same Data</h3>
            <p className='text-base text-foreground/85'>
              Both approaches access the same information, so your experience is
              consistent across both.
            </p>
          </div>
          <div className='p-6 rounded-xl bg-card border-2 border-border'>
            <Server className='w-6 h-6 text-foreground mb-3' />
            <h3 className='font-semibold mb-2 text-base'>
              Learning from Usage
            </h3>
            <p className='text-base text-foreground/85'>
              We track how people use both approaches to understand which works
              better.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
