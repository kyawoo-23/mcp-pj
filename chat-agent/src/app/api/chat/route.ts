import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { createClient } from "@/lib/supabase/server";
import { createTools } from "@/lib/tools";
import {
  createConversation,
  updateConversationTitle,
} from "@/lib/db/conversations";
import { createMessage } from "@/lib/db/messages";
import { MessagePart } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { AVAILABLE_TOOLS } from "@/lib/tool-definitions";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, conversationId } = (await req.json()) as {
    messages: UIMessage[];
    conversationId?: string;
  };

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Initialize tools with authenticated client
  const allTools = createTools(supabase);

  // Ensure user profile exists before creating conversation
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, create a basic one
  // Note: student_id is required for students per database constraint
  if (!profile) {
    const studentId =
      user.user_metadata?.student_id || `TEMP_${user.id.slice(0, 8)}`;
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || null,
        full_name:
          user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: "student",
        student_id: studentId,
      })
      .select()
      .single();

    if (profileError || !newProfile) {
      console.error("Failed to create profile:", profileError);
      return new Response(
        JSON.stringify({
          error: "Failed to create user profile. Please complete your profile.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    profile = newProfile;
  }

  // Get or create conversation
  let currentConversationId: string;
  if (!conversationId) {
    const conversation = await createConversation(user.id);
    currentConversationId = conversation.id;
    revalidatePath("/");
  } else {
    currentConversationId = conversationId;
  }

  // Save the last user message to database
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === "user") {
    const textParts = (lastMessage.parts || []).filter(
      (p): p is { type: "text"; text: string } => p.type === "text"
    );
    const content = textParts.map((p) => p.text).join("\n");
    const parts: MessagePart[] = (lastMessage.parts || []).map((p) => {
      if (p.type === "text") {
        return { type: "text", text: p.text };
      }
      // Preserve other part types as-is
      return p as MessagePart;
    });

    try {
      await createMessage({
        conversationId: currentConversationId,
        role: "user",
        content,
        parts,
      });
    } catch (error) {
      console.error("Failed to save user message:", error);
    }
  }

  // Convert UIMessage format (with parts) to CoreMessage format (with content)
  const coreMessages = await convertToModelMessages(messages);

    const systemPrompt = `
    Today is ${new Date().toLocaleDateString()}.
    You are the Uni-Chat Agent, a friendly and helpful virtual assistant for university students.
    Your tone should be warm, conversational, and encouraging as if you are a supportive senior student or a helpful friend.
    
    ${
      profile
        ? `You are talking to ${profile.full_name}. Their Student ID is ${
            profile.student_id || "unknown"
          }.`
        : ""
    }

    IMPORTANT SYSTEM CONTEXT:
    The student's internal UUID is "${profile?.id || "unknown"}".
    - You MUST use this UUID for all tool calls (bookings, registrations, fetching data).
    - You MUST NOT mention this UUID to the user. Only refer to them by their name or Student ID.
    
    You have access to tools that can help students:
    ${AVAILABLE_TOOLS.map((tool) => `    - ${tool.name}: ${tool.description}`).join("\n")}
    
    When a student asks about courses, facilities, or wants to make a booking/registration, USE THE TOOLS to help them.
    
    RESPONSE STYLE GUIDELINES:
    - Be conversational! Avoid sounding like a robot or a form.
    - When you need more information from the user (like time, date, or purpose for a booking), ask for it naturally in a sentence or two. DONT ASK FOR A LIST OF FIELDS.
    - Example of BAD response: "Please provide: 1. Date 2. Time 3. Purpose"
    - Example of GOOD response: "I can help with that! verified. What time would you like to book the room for? Also, just let me know the date and a quick reason for the booking."
    - Use Markdown for formatting only when necessary for readability (like broad lists of courses), but keep the conversation flowing.
    - But you can highlight important words in bold, or use italics for emphasis when asking for information.
    - When you are not sure about something, ask the user for clarification.
    - If you encounter an error or a request you can't fulfill, be empathetic and suggest alternatives.

    GENERAL INSTRUCTIONS:
    - Before performing any action that modifies data, the system must explicitly ask for user confirmation.
    - The confirmation prompt should clearly state what action will occur and which entity is affected (e.g., “Are you sure you want to register for [Course Name]?” or “Are you sure you want to book [Facility Name]?”).

    COURSE REGISTRATION INSTRUCTION:
    If a student provides a course code (e.g., "BIO101", "CS101") or name but the tool requires a UUID (courseId or sectionId), you MUST first use the \`search_courses\` tool to find the course and get its UUID. Do not assume the code is the ID.
    After finding the course, you usually need to check available sections using \`get_course_sections\` before you can register them.
    If \`get_course_sections\` returns more than one section, you MUST NOT automatically register for one. You MUST list the available sections (number, instructor, time) and ASK the student which one they want to register for. Only proceed with registration after they explicitly confirm the section.
  `;

  const result = streamText({
    model: google("models/gemini-3-flash"),
    system: systemPrompt,
    messages: coreMessages,
    tools: allTools,
    stopWhen: stepCountIs(5), // Allow up to 5 tool call steps
    onFinish: async ({ text, toolCalls, toolResults }) => {
      // Save assistant response to database
      try {
        const parts: MessagePart[] = [{ type: "text", text }];

        // Add tool invocations if any
        if (toolCalls && toolCalls.length > 0) {
          for (let i = 0; i < toolCalls.length; i++) {
            const toolCall = toolCalls[i];
            const toolResult = toolResults?.[i];

            // Extract input from toolCall - it may be in different formats
            const input =
              "args" in toolCall
                ? (toolCall.args as Record<string, unknown>)
                : "input" in toolCall
                ? (toolCall.input as Record<string, unknown>)
                : {};

            // Extract result/error from toolResult
            const result =
              toolResult && "result" in toolResult
                ? toolResult.result
                : toolResult && "output" in toolResult
                ? toolResult.output
                : undefined;
            const error =
              toolResult && "error" in toolResult
                ? String(toolResult.error)
                : undefined;

            parts.push({
              type: "tool-invocation",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              input,
              state: error
                ? "output-error"
                : result !== undefined
                ? "output-available"
                : "input-available",
              output: result,
              errorText: error,
            });
          }
        }

        await createMessage({
          conversationId: currentConversationId,
          role: "assistant",
          content: text,
          parts,
        });

        // Auto-generate conversation title from first user message if title is null
        if (messages.length === 1) {
          const firstUserMessage = messages.find((m) => m.role === "user");
          if (firstUserMessage) {
            const textParts = (firstUserMessage.parts || []).filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            );
            const titleText = textParts
              .map((p) => p.text)
              .join(" ")
              .slice(0, 50);
            if (titleText) {
              await updateConversationTitle(
                currentConversationId,
                user.id,
                titleText
              );
              revalidatePath("/");
            }
          }
        }
      } catch (error) {
        console.error("Failed to save assistant message:", error);
      }
    },
  });

  // Return response with conversationId in headers
  const response = result.toUIMessageStreamResponse();
  response.headers.set("X-Conversation-Id", currentConversationId);
  return response;
}
