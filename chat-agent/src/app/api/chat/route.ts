import { google, GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
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
import { getTaskSessionByUser, recordTaskEvent } from "@/lib/task-mode-server";
import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Feature flag for MCP mode
const USE_MCP = process.env.USE_MCP === "true";

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

  // Initialize tools - either from MCP server or direct implementation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allTools: Record<string, any>;
  let mcpClient: MCPClient | null = null;

  if (USE_MCP && process.env.MCP_SERVER_URL) {
    try {
      mcpClient = await createMCPClient({
        transport: {
          type: "http",
          url: process.env.MCP_SERVER_URL,
          headers: process.env.MCP_AUTH_TOKEN
            ? { Authorization: `Bearer ${process.env.MCP_AUTH_TOKEN}` }
            : undefined,
        },
      });
      allTools = await mcpClient.tools();
      console.log("✅ Using MCP tools from:", process.env.MCP_SERVER_URL);
    } catch (error) {
      console.error("❌ MCP connection failed, falling back to direct tools:", error);
      allTools = createTools(supabase);
    }
  } else {
    allTools = createTools(supabase);
  }

  // Close MCP client when response is done
  const closeMcpClient = async () => {
    if (mcpClient) {
      try {
        await mcpClient.close();
      } catch (e) {
        console.error("Error closing MCP client:", e);
      }
    }
  };

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

  // Log task mode turn if active
  const taskSession = await getTaskSessionByUser(
    supabase,
    user.id,
    "chat_agent"
  );
  const lastMessage = messages[messages.length - 1];
  if (
    taskSession &&
    taskSession.status === "in_progress" &&
    lastMessage?.role === "user"
  ) {
    const textParts = (lastMessage.parts || []).filter(
      (p): p is { type: "text"; text: string } => p.type === "text"
    );
    const content = textParts.map((p) => p.text).join("\n");
    await recordTaskEvent(supabase, taskSession.id, "turn", "user_message", {
      conversation_id: conversationId ?? null,
      message_length: content.length,
    });
  }

  // Save the last user message to database
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
    Current Date and Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.
    
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
    - Be conversational! Avoid sounding like a form or robot.
    - Ask for missing information naturally (e.g., "What time works best for you?" instead of "Provide: Time").
    - Use Markdown for lists (courses/schedules) but keep regular chat plain text (But you can highlight important words in bold, or use italics for emphasis when asking for or providing information).
    - If an error occurs, be empathetic and suggest alternatives.

    CRITICAL WORKFLOW RULES:
    1. **Confirmation**: Before modifying data (booking/registering), YOU MUST explicitly ask for confirmation.
       - Clear: "Shall I go ahead and book the Tennis Court for 5 PM?"
       - Wait for a "Yes" or equivalent before calling the booking tool.

    2. **Course Registration**:
       - User gives Code/Name -> Call \`search_courses\` to get UUID.
       - If found -> Call \`get_course_sections\` to see options.
       - If multiple sections -> List them and ASK which one to pick.
       - **NEVER** assume a section or auto-register without user selection.

    3. **Facility Booking**:
       - User gives Name -> Call \`search_facilities\` to get UUID.
       - Then ask for Date/Time if missing.
       - confirm details -> call \`book_facility\`.
  `;

  const result = streamText({
    model: google(`models/${process.env.GOOGLE_GENERATIVE_MODEL_ID || "gemini-2.5-flash"}`),
    providerOptions: {
      google: {
        thinkingConfig: {
          includeThoughts: true,
          thinkingBudget: 8192,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
    },
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
      } finally {
        // Clean up MCP client connection
        await closeMcpClient();
      }
    },
  });

  // Return response with conversationId in headers
  const response = result.toUIMessageStreamResponse();
  response.headers.set("X-Conversation-Id", currentConversationId);
  return response;
}
