import Link from "next/link";
import {
  getChatAgentBaseUrl,
  getUniBookingBaseUrl,
  getUniRegistrationBaseUrl,
} from "@/utils/constants";

export function Footer() {
  const links = [
    { label: "uni-booking", url: getUniBookingBaseUrl() },
    { label: "uni-registration", url: getUniRegistrationBaseUrl() },
    { label: "chat-agent", url: getChatAgentBaseUrl() },
  ];

  return (
    <footer className='py-12 px-6 bg-foreground text-primary-foreground'>
      <div className='max-w-6xl mx-auto'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-8'>
          <div>
            <h3 className='font-semibold text-lg mb-2'>Website Design Study</h3>
            <p className='text-base text-primary-foreground/85 max-w-md'>
              Comparing traditional websites with AI chat assistants to
              understand which approach works better for users.
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-6 md:gap-12'>
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
                    className='text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors font-medium'
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
                  className='text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors font-medium'
                >
                  Take the Survey
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
                  className='text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors font-medium'
                >
                  AI SDK
                </Link>
                <Link
                  href='https://modelcontextprotocol.io'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors font-medium'
                >
                  MCP Documentation
                </Link>
                <Link
                  href='https://supabase.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors font-medium'
                >
                  Supabase
                </Link>
              </div>
            </div>
            <div>
              <p className='text-xs md:text-sm uppercase tracking-wide text-primary-foreground/80 mb-3 font-semibold'>
                Contact
              </p>
              <div className='flex flex-col gap-2'>
                <a
                  href='mailto:6878035423@student.chula.ac.th'
                  className='text-base text-primary-foreground/85 hover:text-primary-foreground transition-colors font-medium'
                >
                  6878035423@student.chula.ac.th
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-12 pt-8 border-t border-primary-foreground/20'>
          <p className='text-base text-primary-foreground/80 text-center font-medium'>
            User Experience Study: Traditional Websites vs. AI Chat Assistants
          </p>
        </div>
      </div>
    </footer>
  );
}
