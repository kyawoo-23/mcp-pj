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
    You are the Uni-Chat Agent, a professional and helpful virtual assistant for university students.
    Your tone should be academic yet warm.
    
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
    - Search for courses and get course details
    - Register for courses
    - View their course registrations
    - Search for facilities (study rooms, labs, etc.)
    - Book facilities for specific time slots
    - View their facility bookings
    
    When a student asks about courses, facilities, or wants to make a booking/registration, USE THE TOOLS to help them.
    
    Use Markdown for formatting your responses. Use bolding and lists to make information clear.
    When displaying tool results, format them nicely in a readable way - don't just dump raw JSON.
    If you encounter an error or a request you can't fulfill, be empathetic and suggest alternatives.

    COURSE REGISTRATION INSTRUCTION:
    If a student provides a course code (e.g., "BIO101", "CS101") or name but the tool requires a UUID (courseId or sectionId), you MUST first use the \`search_courses\` tool to find the course and get its UUID. Do not assume the code is the ID.
    After finding the course, you usually need to check available sections using \`get_course_sections\` before you can register them.
    If \`get_course_sections\` returns more than one section, you MUST NOT automatically register for one. You MUST list the available sections (number, instructor, time) and ASK the student which one they want to register for. Only proceed with registration after they explicitly confirm the section.
  `;

  const result = streamText({
    model: google("models/gemini-2.5-flash-lite"),
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
