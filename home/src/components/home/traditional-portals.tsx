import { Calendar, BookOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  getUniBookingBaseUrl,
  getUniRegistrationBaseUrl,
} from "@/utils/constants";

const portals = [
  {
    id: "uni-booking",
    title: "Facility Booking Portal",
    description:
      "Book rooms and facilities by browsing available options, selecting dates, and filling out a booking form.",
    icon: Calendar,
    getUrl: getUniBookingBaseUrl,
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
    description:
      "Register for courses by browsing the catalog, selecting classes, and completing registration forms.",
    icon: BookOpen,
    getUrl: getUniRegistrationBaseUrl,
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
    <section className='py-24 px-6 bg-indigo-500/5'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <div className='inline-flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border-2 border-indigo-500/30 rounded-full mb-6'>
            <span className='text-lg md:text-xl font-bold tracking-wide uppercase text-indigo-600 dark:text-indigo-400'>
              Approach A
            </span>
          </div>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tight mb-4'>
            Traditional Web Portals
          </h2>
          <p className='text-foreground/90 max-w-2xl mx-auto text-base'>
            The way websites usually work: you click through pages, fill out
            forms, and follow step-by-step instructions to get things done.
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8'>
          {portals.map((portal) => (
            <div
              key={portal.id}
              className='group bg-card rounded-xl border-2 border-border p-8 hover:border-foreground/40 transition-all'
            >
              <div className='flex items-start justify-between mb-6'>
                <div className='p-3.5 rounded-lg bg-muted'>
                  <portal.icon className='w-7 h-7 text-foreground' />
                </div>
              </div>

              <h3 className='text-xl md:text-2xl font-semibold mb-3'>
                {portal.title}
              </h3>
              <p className='text-foreground/85 text-base mb-6 leading-relaxed'>
                {portal.description}
              </p>

              <div className='space-y-2.5 mb-8'>
                {portal.features.map((feature, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-3 text-base'
                  >
                    <div className='w-2 h-2 rounded-full bg-foreground/70' />
                    <span className='text-foreground/90 font-medium'>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href={portal.getUrl()}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary transition-colors'
              >
                View Portal
                <ArrowUpRight className='w-5 h-5' />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
