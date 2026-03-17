import Link from "next/link";
import {
  getChatAgentBaseUrl,
  getUniBookingBaseUrl,
  getUniRegistrationBaseUrl,
} from "@/utils/constants";

export function Footer() {
  const links = [
    { label: "booking", url: getUniBookingBaseUrl() },
    { label: "registration", url: getUniRegistrationBaseUrl() },
    { label: "chat-agent", url: getChatAgentBaseUrl() },
  ];

  return (
    <footer
      className='py-12 px-6 bg-foreground text-primary-foreground border-t border-primary-foreground/15'
      id='footer'
    >
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-8'>
          <div>
            <h3 className='font-semibold text-lg mb-2 text-balance'>
              Comparing Intent-Driven and Interface-Driven Interaction
            </h3>
            <p className='text-sm md:text-base text-primary-foreground/85 max-w-md leading-relaxed'>
              Part of a research project at Chulalongkorn University comparing
              traditional web interfaces with MCP-based conversational AI.
              Conducted by{" "}
              <Link
                href='https://kko-portfolio.vercel.app/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary-foreground hover:text-primary-foreground transition-colors'
              >
                Kyaw Kyaw Oo
              </Link>{" "}
              under the supervision of Dr. Arthorn Luangsodsai and Dr.
              Pattarasinee Bhattarakosol.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-6 md:gap-10'>
            <div>
              <p className='text-xs md:text-sm uppercase tracking-wide text-primary-foreground/80 mb-3 font-semibold'>
                Projects
              </p>
              <div className='flex flex-col gap-2'>
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm md:text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors'
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className='text-xs md:text-sm uppercase tracking-wide text-primary-foreground/80 mb-3 font-semibold'>
                Participate
              </p>
              <div className='flex flex-col gap-2'>
                <Link
                  href='/survey'
                  className='text-sm md:text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors font-medium'
                >
                  Take the survey
                </Link>
              </div>
            </div>

            <div>
              <p className='text-xs md:text-sm uppercase tracking-wide text-primary-foreground/80 mb-3 font-semibold'>
                Resources
              </p>
              <div className='flex flex-col gap-2'>
                <Link
                  href='https://ai-sdk.dev/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm md:text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors'
                >
                  AI SDK
                </Link>
                <Link
                  href='https://modelcontextprotocol.io'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm md:text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors'
                >
                  MCP docs
                </Link>
                <Link
                  href='https://supabase.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm md:text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors'
                >
                  Supabase
                </Link>
                <Link
                  href='https://github.com/kyawoo-23/mcp-pj'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm md:text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors'
                >
                  GitHub
                </Link>
              </div>
            </div>

            <div>
              <p className='text-xs md:text-sm uppercase tracking-wide text-primary-foreground/80 mb-3 font-semibold'>
                Contact
              </p>
              <div className='flex flex-col gap-2'>
                <a
                  href='mailto:kyawkyawjek@gmail.com'
                  className='text-sm md:text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors'
                >
                  kyawkyawjek@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-10 pt-6 border-t border-primary-foreground/20'>
          <p className='text-xs md:text-sm text-primary-foreground/80 text-center font-medium'>
            2026 - Traditional UI vs MCP Conversational System (Chulalongkorn
            University)
          </p>
        </div>
      </div>
    </footer>
  );
}
