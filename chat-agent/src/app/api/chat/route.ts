import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { supabase } from "@/lib/supabase";
import { allTools } from "@/lib/tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  // Convert UIMessage format (with parts) to CoreMessage format (with content)
  const coreMessages = await convertToModelMessages(messages);

  // 1. Fetch user profile (In a real app, you'd get the user ID from auth)
  // For this initial track, we'll fetch a sample profile to demonstrate the context injection.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();

  const systemPrompt = `
    You are the Uni-Chat Agent, a professional and helpful virtual assistant for university students.
    Your tone should be academic yet warm.
    
    ${profile ? `You are talking to ${profile.full_name} from the ${profile.department} department. Their student ID is: ${profile.id}` : ""}
    
    You have access to tools that can help students:
    - Search for courses and get course details
    - Register for courses
    - View their course registrations
    - Search for facilities (study rooms, labs, etc.)
    - Book facilities for specific time slots
    - View their facility bookings
    
    When a student asks about courses, facilities, or wants to make a booking/registration, USE THE TOOLS to help them.
    Always use the student's ID (${profile?.id || "unknown"}) when making bookings or registrations on their behalf.
    
    Use Markdown for formatting your responses. Use bolding and lists to make information clear.
    When displaying tool results, format them nicely in a readable way - don't just dump raw JSON.
    If you encounter an error or a request you can't fulfill, be empathetic and suggest alternatives.
  `;

  const result = streamText({
    model: google("models/gemini-2.5-flash-lite"),
    system: systemPrompt,
    messages: coreMessages,
    tools: allTools,
    stopWhen: stepCountIs(5), // Allow up to 5 tool call steps
  });

  return result.toUIMessageStreamResponse();
}
