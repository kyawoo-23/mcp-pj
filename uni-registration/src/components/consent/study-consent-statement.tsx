import {
  STUDY_CONSENT_CONTACT,
  STUDY_CONSENT_SECTIONS,
} from "@/lib/study-consent";

export function StudyConsentStatement() {
  return (
    <div className='space-y-3 rounded-md border p-3 text-sm leading-relaxed text-muted-foreground'>
      {STUDY_CONSENT_SECTIONS.map((section) => (
        <section key={section.title ?? "intro"} className='space-y-1'>
          {section.title ? (
            <h2 className='text-sm font-medium text-foreground'>
              {section.title}
            </h2>
          ) : null}
          <p>{section.body}</p>
        </section>
      ))}
      <p>
        Contact: <span className='text-foreground'>{STUDY_CONSENT_CONTACT}</span>
      </p>
    </div>
  );
}
