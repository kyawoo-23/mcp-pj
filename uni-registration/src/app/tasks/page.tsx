import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskModeGate } from "@/components/tasks/task-mode-gate";

export default function TasksPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_TASK !== "true") {
    notFound();
  }
  return <TasksGateWrapper />;
}

async function TasksGateWrapper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: profile }, { data: session }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, age_range, gender")
      .eq("id", user.id)
      .single(),
    supabase
      .from("task_sessions")
      .select("id, status, system_type")
      .eq("user_id", user.id)
      .eq("system_type", "uni-registration")
      .maybeSingle(),
  ]);

  return (
    <TaskModeGate
      profile={profile}
      session={session}
      systemType="uni-registration"
    />
  );
}
