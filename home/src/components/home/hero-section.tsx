"use client";

import { ArrowDown } from "lucide-react";

export function HeroSection() {
  const scrollToResearch = () => {
    document.getElementById("research-target")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-foreground text-primary-foreground px-6 py-24">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm tracking-widest uppercase text-muted-foreground mb-6">
          Research Study
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight text-balance mb-8">
          Traditional Web Portals vs. MCP Chat Interfaces
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
          Exploring how the Model Context Protocol may reshape human-computer interaction 
          by shifting from interface-driven to intent-driven experiences.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToResearch}
            className="inline-flex items-center gap-2 px-6 py-3 border border-primary-foreground/30 rounded-full text-sm hover:bg-primary-foreground hover:text-foreground transition-colors"
          >
            Explore Research
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="w-px h-16 bg-primary-foreground/20" />
      </div>
    </section>
  );
}
