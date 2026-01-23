export function Footer() {
  const links = [
    { label: "uni-booking", port: 4001 },
    { label: "uni-registration", port: 4002 },
    { label: "chat-agent", port: 4000 },
  ];

  return (
    <footer className="py-12 px-6 bg-foreground text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="font-medium text-lg mb-2">MCP Research Project</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Exploring the future of human-computer interaction through 
              Model Context Protocol and conversational AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Projects
              </p>
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={`http://localhost:${link.port}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Resources
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://modelcontextprotocol.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  MCP Documentation
                </a>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Supabase
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <p className="text-sm text-muted-foreground text-center">
            Research Study on Traditional Web Portals vs. MCP Chat Interfaces
          </p>
        </div>
      </div>
    </footer>
  );
}
