const TEST_RECIPIENTS = [
  { email: "kyawkyawjek@gmail.com", name: "Kyaw Kyaw Oo" },
  { email: "6878035423@student.chula.ac.th", name: "Kyaw Kyaw Oo" },
];

const inviteHtml = await Deno.readTextFile(
  new URL("./invite.html", import.meta.url),
);

Deno.serve(async () => {
  // Test mode: batch-send only to fixed addresses (contacts query disabled)
  const recipients = TEST_RECIPIENTS.map((r) => r.email);
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) {
    console.error("[send-campaign] missing BREVO_API_KEY");
    return Response.json(
      { error: "BREVO_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "Kyaw Kyaw Oo – MCP Research Project",
        email: "research@mcp-project.app",
      },
      replyTo: {
        email: "no-reply@mcp-project.app",
        name: "MCP Project",
      },
      subject: "You're invited to join our follow-up research study",
      htmlContent: inviteHtml,
      tags: ["mcp-project-v2"],
      // Recipients must live inside messageVersions (no outer `to`)
      messageVersions: TEST_RECIPIENTS.map((recipient) => ({
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
    });
    return Response.json(body, { status: response.status });
  }

  // Batch send returns messageIds[] — one ID per message version (for logs/webhooks)
  console.log("[send-campaign] sent", {
    to: recipients,
    messageIds: body.messageIds,
  });

  return Response.json({
    sent: TEST_RECIPIENTS.length,
    test: true,
    to: recipients,
    messageIds: body.messageIds,
  });
});
