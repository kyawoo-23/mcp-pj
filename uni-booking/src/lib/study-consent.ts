export const STUDY_CONSENT_VERSION = "2026-11-09";

export const STUDY_CONSENT_CONTACT =
  "Kyaw Kyaw Oo, Department of Mathematics and Computer Science, Chulalongkorn University, kyawkyawjek@gmail.com";

export const STUDY_CONSENT_SECTIONS: { title?: string; body: string }[] = [
  {
    body: "This study compares two ways of completing the same university-style tasks: using menus and forms, and telling a chat assistant what you want in your own words. The tasks are practice tasks. They do not change your real course registration or room bookings.",
  },
  {
    title: "What you will do",
    body: "You create an account, answer a short background form, and complete four tasks in each system: register a course, drop a course, book a room, and cancel a booking. You then answer short questionnaires. This usually takes about 15–20 minutes. You may use any language in the chat.",
  },
  {
    title: "Your choice",
    body: "Taking part is voluntary. You can stop at any time. Stopping has no effect on your grades, enrollment, or university services.",
  },
  {
    title: "What we store",
    body: "We store your name, email, and student ID so we can keep your sessions together. We also store your background answers, task timing, questionnaire answers, and chat messages.",
  },
  {
    title: "Who else processes this data",
    body: "The database is hosted with Supabase. Chat messages are sent to Google Gemini so the assistant can reply. The apps send error reports to Sentry, which may include a short screen recording when something goes wrong, and those reports can include information you typed. The study home page uses Vercel Analytics for page visits. We may email you about the study. Do not reply to those messages. Write to the address below if you need to reach the researcher.",
  },
  {
    title: "Risks and benefits",
    body: "The main burden is your time, and a task or the chat assistant may be frustrating. There is no payment and no grade or enrollment benefit.",
  },
  {
    title: "Confidentiality and withdrawal",
    body: `Published results use combined numbers. If we quote something you wrote, we remove your name, email, and student ID. The researcher keeps direct identifiers until the study analysis is finished, then deletes them or stores them separately from your answers. You can email ${STUDY_CONSENT_CONTACT} and ask for your account, chats, and answers to be deleted. Deletion removes your research record. It cannot undo numbers already published as group results.`,
  },
];
