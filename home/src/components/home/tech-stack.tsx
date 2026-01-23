import { Server, Layers, GitBranch, Database } from "lucide-react";

export function TechStack() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4 block">
            Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Technical Implementation
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All prototype systems share a common backend infrastructure to ensure 
            fair comparison of user experience across different interaction paradigms.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="bg-card rounded-xl border border-border p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Frontend Layer */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Layers className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-medium mb-2">Frontend Layer</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="p-2 bg-muted rounded">uni-booking (4001)</p>
                <p className="p-2 bg-muted rounded">uni-registration (4002)</p>
                <p className="p-2 bg-muted rounded">chat-agent (4000)</p>
              </div>
            </div>

            {/* API Layer */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Server className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-medium mb-2">API Layer</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="p-2 bg-muted rounded">Next.js API Routes</p>
                <p className="p-2 bg-muted rounded">MCP Server Tools</p>
                <p className="p-2 bg-muted rounded">Server Actions</p>
              </div>
            </div>

            {/* Data Layer */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Database className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-medium mb-2">Data Layer</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="p-2 bg-accent/10 border border-accent/20 rounded text-accent">
                  Supabase (Shared)
                </p>
                <p className="p-2 bg-muted rounded">PostgreSQL</p>
                <p className="p-2 bg-muted rounded">Row Level Security</p>
              </div>
            </div>
          </div>

          {/* Connection Lines (visual representation) */}
          <div className="hidden md:flex justify-center items-center gap-4 mt-8 pt-8 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-foreground/20" />
              <span className="text-sm text-muted-foreground">Data Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Shared Resource</span>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <GitBranch className="w-5 h-5 text-foreground mb-3" />
            <h3 className="font-medium mb-2">Version Control</h3>
            <p className="text-sm text-muted-foreground">
              Each prototype is maintained in separate branches with shared 
              database migrations.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Database className="w-5 h-5 text-foreground mb-3" />
            <h3 className="font-medium mb-2">Unified Schema</h3>
            <p className="text-sm text-muted-foreground">
              Single database schema ensures consistent data structure across 
              all interaction methods.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-card border border-border">
            <Server className="w-5 h-5 text-foreground mb-3" />
            <h3 className="font-medium mb-2">Analytics Integration</h3>
            <p className="text-sm text-muted-foreground">
              Shared analytics layer for comparing user behavior and performance 
              metrics.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
