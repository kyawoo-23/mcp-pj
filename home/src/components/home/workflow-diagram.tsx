import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";

export function WorkflowDiagram() {
  return (
    <section className='py-20 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <span className='text-sm md:text-base font-semibold text-accent-foreground tracking-wider uppercase'>
            How It Works
          </span>
          <h2 className='text-3xl md:text-4xl font-bold mt-2 text-foreground text-balance'>
            System Architecture and Workflow
          </h2>
          <p className='mt-4 text-foreground/90 max-w-2xl mx-auto text-pretty text-base'>
            Three layers: user interaction (web apps + chat agent), application
            services (REST/GraphQL + MCP), and data/analytics. Both pathways
            connect to the same database.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <div className='group relative cursor-zoom-in bg-card rounded-lg border-2 border-border p-4 md:p-8 shadow-sm transition-all hover:border-foreground/20'>
              <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 z-10'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-sm font-medium shadow-lg border border-border'>
                  <Maximize2 className='w-4 h-4' />
                  Click to enlarge
                </div>
              </div>
              <Image
                src='/Project Plan.png'
                alt='System architecture: traditional web interfaces and MCP-based conversational system interaction pathways'
                width={1200}
                height={800}
                className='w-full h-auto transition-transform duration-500 group-hover:scale-[1.01]'
                priority
              />
            </div>
          </DialogTrigger>
          <DialogContent className='max-w-7xl w-[98vw] max-h-[98vh] p-0 border-none bg-transparent shadow-none sm:max-w-7xl'>
            <div className='relative w-full h-full flex items-center justify-center p-2 md:p-4'>
              <Image
                src='/Project Plan.png'
                alt='Workflow Diagram Fullscreen'
                width={2000}
                height={1500}
                className='max-w-full max-h-[95vh] object-contain shadow-2xl'
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Legend */}
      <div className='mt-8 flex flex-wrap justify-center gap-6'>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded bg-[#3b82f6]' />
          <span className='text-base font-medium text-foreground/90'>
            Facility & Course Registration Web Apps
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded bg-[#ef4444]' />
          <span className='text-base font-medium text-foreground/90'>
            MCP Chat Agent
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded bg-[#22c55e]' />
          <span className='text-base font-medium text-foreground/90'>
            Shared Database
          </span>
        </div>
        <div className='flex items-center gap-3'>
          <div className='w-5 h-5 rounded border-2 border-dashed border-[#f97316]' />
          <span className='text-base font-medium text-foreground/90'>
            Analytics
          </span>
        </div>
      </div>
    </section>
  );
}
