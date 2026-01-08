import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConversations } from "@/lib/db/conversations";

export default async function ChatIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch conversations server-side
  const conversations = await getConversations(user.id);

  if (conversations.length > 0) {
    // Redirect to the latest conversation
    redirect(`/c/${conversations[0].id}`);
  } else {
    // Redirect to new chat
    redirect("/c/new");
  }
}
