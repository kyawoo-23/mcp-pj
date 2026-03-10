const comparisons = [
  {
    aspect: "Interface",
    traditional: "Menus, forms, buttons",
    mcp: "Chat, natural language",
  },
  {
    aspect: "Execution",
    traditional: "Navigate to the page, select options, submit forms",
    mcp: "Describe your goal; system interprets and executes via MCP",
  },
  {
    aspect: "Backend",
    traditional: "REST / GraphQL",
    mcp: "MCP",
  },
  {
    aspect: "Control",
    traditional: "Higher for general users",
    mcp: "Higher for advanced users",
  },
  {
    aspect: "Trust",
    traditional: "More trusted across users",
    mcp: "Lower for unsupervised use",
  },
  {
    aspect: "Data",
    traditional: "Shared database",
    mcp: "Same database",
  },
];

export function ComparisonTable() {
  return (
    <section className='py-24 px-6 bg-background'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <span className='text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80 mb-4 block'>
            Experimental Systems
          </span>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
            Traditional UI vs MCP Conversational System
          </h2>
          <p className='text-foreground/90 max-w-2xl mx-auto text-base'>
            Both systems share the same backend and business logic, so
            differences come from how you interact, not what the system does.
          </p>
        </div>

        {/* Comparison Table */}
        <div className='overflow-x-auto mb-16'>
          <table className='w-full border-collapse'>
            <thead>
              <tr className='border-b-2 border-border'>
                <th className='text-left py-5 px-5 text-base font-semibold text-foreground'>
                  Aspect
                </th>
                <th className='text-left py-5 px-5 text-base font-semibold text-foreground'>
                  Traditional
                </th>
                <th className='text-left py-5 px-5 text-base font-semibold text-foreground'>
                  MCP Chat
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr
                  key={index}
                  className='border-b border-border hover:bg-muted/40 transition-colors'
                >
                  <td className='py-5 px-5 font-semibold text-base text-foreground'>
                    {row.aspect}
                  </td>
                  <td className='py-5 px-5 text-base text-foreground/85'>
                    {row.traditional}
                  </td>
                  <td className='py-5 px-5 text-base text-foreground/85'>
                    {row.mcp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
