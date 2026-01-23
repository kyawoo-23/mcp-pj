import Image from "next/image";

export function WorkflowDiagram() {
  return (
    <section className='py-20 bg-background'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <span className='text-sm font-medium text-accent tracking-wider uppercase'>
            System Architecture
          </span>
          <h2 className='text-3xl md:text-4xl font-bold mt-2 text-foreground text-balance'>
            Research Workflow Diagram
          </h2>
          <p className='mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty'>
            Overview of the research architecture comparing traditional web
            applications with MCP-powered chat interfaces, both connected to a
            shared database with metrics collection for analysis.
          </p>
        </div>
        <div className='bg-card rounded-lg border border-border p-4 md:p-8 shadow-sm'>
          <Image
            src='/Project Plan.png'
            alt='Research workflow diagram showing traditional web apps and MCP chat agent connected to shared database with metrics analysis'
            width={1200}
            height={800}
            className='w-full h-auto'
            priority
          />
        </div>
      </div>

      {/* Legend */}
      <div className='mt-8 flex flex-wrap justify-center gap-6'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-[#3b82f6]' />
          <span className='text-sm text-muted-foreground'>
            Traditional Web Apps
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-[#ef4444]' />
          <span className='text-sm text-muted-foreground'>
            MCP Chat Interface
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded bg-[#22c55e]' />
          <span className='text-sm text-muted-foreground'>Shared Database</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 rounded border-2 border-dashed border-[#f97316]' />
          <span className='text-sm text-muted-foreground'>
            Metrics Collection
          </span>
        </div>
      </div>
    </section>
  );
}
