const comparisons = [
  {
    aspect: "Interaction Method",
    traditional: "Forms & Buttons",
    mcp: "Natural Language",
  },
  {
    aspect: "Navigation",
    traditional: "Multi-page, menu-based",
    mcp: "Single interface",
  },
  {
    aspect: "Learning Curve",
    traditional: "Moderate - need to learn the interface",
    mcp: "Low - just chat naturally",
  },
  {
    aspect: "Task Completion",
    traditional: "Follow steps one by one",
    mcp: "AI adapts to what you need",
  },
  {
    aspect: "User Control",
    traditional: "High - you control every step",
    mcp: "Moderate - AI helps along the way",
  },
  {
    aspect: "Accessibility",
    traditional: "Depends on implementation",
    mcp: "Text friendly",
  },
];

export function ComparisonTable() {
  return (
    <section className='py-24 px-6 bg-background'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <span className='text-sm md:text-base font-semibold tracking-wide uppercase text-foreground/80 mb-4 block'>
            Side-by-Side
          </span>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
            Comparison Overview
          </h2>
          <p className='text-foreground/90 max-w-2xl mx-auto text-base'>
            Here&apos;s how the two approaches compare side by side.
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
                  Traditional Portal
                </th>
                <th className='text-left py-5 px-5 text-base font-semibold text-foreground'>
                  AI Chat Assistant
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
