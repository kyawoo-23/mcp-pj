import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const inviteHtml = await Deno.readTextFile(
  new URL("./invite.html", import.meta.url),
);

/** Plain-text twin — multipart emails land in Primary more often than HTML-only. */
const inviteText = [
  "Hello {{params.name}},",
  "",
  "Thank you for taking part in our study earlier this year (February 5–18, 2026), where you compared traditional university portals with a conversational AI agent (MCP). That study is complete and already published.",
  "",
  "Results: https://mcp-project.app/research?protocol=v1",
  "Paper: https://www.researchgate.net/publication/408867009_Comparing_Intent-Driven_and_Interface-Driven_Interaction_An_Empirical_Study_of_Traditional_UI_and_Conversational_AI_Using_the_Model_Context_Protocol",
  "",
  "We are now running a follow-up study where tasks have specific targets (course, section, facility, time). We would be grateful if you could join again — about 15–20 minutes, same four tasks on both systems, plus brief SUS / SDT / NASA-TLX questions.",
  "",
  "Survey: https://mcp-project.app/survey",
  "Overview: https://mcp-project.app",
  "My study results: https://mcp-project.app/survey/history",
  "",
  "Thank you again for your time.",
  "",
  "With appreciation,",
  "Kyaw Kyaw Oo",
  "MCP Research Project · Chulalongkorn University",
  "",
  "For questions: 6878035423@student.chula.ac.th",
].join("\n");

type Recipient = { email: string; name: string };

/** Test-only allowlist — remove to send to all auth users. */
const TEST_USER_IDS = new Set([
  "e4959f34-6f03-44c8-abdd-9f552d845da0",
  "663f9624-2472-4a78-80b0-d3e68f50e97c",
]);

async function listAllAuthRecipients(
  supabase: ReturnType<typeof createClient>,
): Promise<Recipient[]> {
  const perPage = 1000;
  let page = 1;
  const recipients: Recipient[] = [];

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    for (const user of data.users) {
      if (!TEST_USER_IDS.has(user.id)) continue;
      if (!user.email) continue;
      const name =
        (user.user_metadata?.full_name as string | undefined)?.trim() ||
        user.email;
      recipients.push({ email: user.email, name });
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return recipients;
}

Deno.serve(async () => {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!apiKey) {
    console.error("[send-campaign] missing BREVO_API_KEY");
    return Response.json(
      { error: "BREVO_API_KEY is not configured" },
      { status: 500 },
    );
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[send-campaign] missing Supabase credentials");
    return Response.json(
      { error: "Supabase credentials are not configured" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let allRecipients: Recipient[];
  try {
    allRecipients = await listAllAuthRecipients(supabase);
  } catch (err) {
    console.error("[send-campaign] listUsers failed", err);
    return Response.json(
      { error: "Failed to list auth users", details: String(err) },
      { status: 500 },
    );
  }

  if (allRecipients.length === 0) {
    return Response.json({ sent: 0, to: [], messageIds: [] });
  }

  const BATCH_SIZE = 20;
  const messageIds: string[] = [];
  const sentEmails: string[] = [];

  for (let i = 0; i < allRecipients.length; i += BATCH_SIZE) {
    const batch = allRecipients.slice(i, i + BATCH_SIZE);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Kyaw Kyaw Oo",
          email: "research@mcp-project.app",
        },
        replyTo: {
          email: "6878035423@student.chula.ac.th",
          name: "Kyaw Kyaw Oo",
        },
        subject: "Follow-up from our February MCP study — Kyaw Kyaw Oo",
        htmlContent: inviteHtml,
        textContent: inviteText,
        tags: ["mcp-project-v2"],
        messageVersions: batch.map((recipient) => ({
          to: [
            {
              email: recipient.email,
              name: recipient.name,
            },
          ],
          params: {
            name: recipient.name,
          },
        })),
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      console.error("[send-campaign] Brevo error", {
        status: response.status,
        body,
        batchStart: i,
        batchSize: batch.length,
      });
      return Response.json(
        {
          error: body,
          sent: sentEmails.length,
          to: sentEmails,
          messageIds,
        },
        { status: response.status },
      );
    }

    if (Array.isArray(body.messageIds)) {
      messageIds.push(...body.messageIds);
    }
    sentEmails.push(...batch.map((r) => r.email));
  }

  console.log("[send-campaign] sent", {
    to: sentEmails,
    messageIds,
  });

  return Response.json({
    sent: sentEmails.length,
    to: sentEmails,
    messageIds,
  });
});
