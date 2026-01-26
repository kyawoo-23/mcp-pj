import Image from "next/image";

export function WorkflowDiagram() {
  return (
    <section className='py-20 bg-background'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <span className='text-sm md:text-base font-semibold text-accent-foreground tracking-wider uppercase'>
            How It Works
          </span>
          <h2 className='text-3xl md:text-4xl font-bold mt-2 text-foreground text-balance'>
            See How Both Approaches Work
          </h2>
          <p className='mt-4 text-foreground/90 max-w-2xl mx-auto text-pretty text-base'>
            Both the traditional websites and the AI chat assistant connect to the same 
            system, so we can fairly compare how they work and which feels better to use.
          </p>
        </div>
        <div className='bg-card rounded-lg border-2 border-border p-4 md:p-8 shadow-sm'>
          <Image
            src='/Project Plan.png'
            alt='Diagram showing traditional websites and AI chat assistant both connected to the same system'
            width={1200}
            height={800}
            className='w-full h-auto'
            priority
          />
        </div>
      </div>

      {/* Legend */}
      <div className='mt-8 flex flex-wrap justify-center gap-6'>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded bg-[#3b82f6]' />
          <span className='text-base font-medium text-foreground/90'>
            Traditional Web Apps
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded bg-[#ef4444]' />
          <span className='text-base font-medium text-foreground/90'>
            AI Chat Assistant
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded bg-[#22c55e]' />
          <span className='text-base font-medium text-foreground/90'>Shared Database</span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded border-2 border-dashed border-[#f97316]' />
          <span className='text-base font-medium text-foreground/90'>
            Usage Tracking
          </span>
        </div>
      </div>
    </section>
  );
}
