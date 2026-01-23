import { Calendar, BookOpen, ArrowUpRight } from "lucide-react";

const portals = [
  {
    id: "uni-booking",
    title: "Facility Booking Portal",
    port: 4001,
    description:
      "Traditional web portal for university facility booking with form-based interactions and multi-page navigation.",
    icon: Calendar,
    features: [
      "Browse available facilities",
      "Search & filter options",
      "Calendar-based booking",
      "Booking management dashboard",
    ],
  },
  {
    id: "uni-registration",
    title: "Course Registration Portal",
    port: 4002,
    description:
      "Traditional web portal for course registration featuring structured forms and step-by-step workflows.",
    icon: BookOpen,
    features: [
      "Browse course catalog",
      "Search & filter courses",
      "Section selection",
      "Schedule management",
    ],
  },
];

export function TraditionalPortals() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground mb-4 block">
            Approach A
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Traditional Web Portals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Interface-driven experiences relying on visual navigation, forms, 
            and structured user flows to complete tasks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className="group bg-card rounded-xl border border-border p-8 hover:border-foreground/20 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-lg bg-muted">
                  <portal.icon className="w-6 h-6 text-foreground" />
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  Port {portal.port}
                </span>
              </div>

              <h3 className="text-xl font-medium mb-3">{portal.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {portal.description}
              </p>

              <div className="space-y-2 mb-8">
                {portal.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1 h-1 rounded-full bg-foreground/40" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={`http://localhost:${portal.port}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                View Portal
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
