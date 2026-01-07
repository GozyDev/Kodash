import { createClient } from "@/lib/superbase/superbase-server";

export async function GET() {
  try {
    const supabase = await createClient();
    const channel = supabase.channel("task-channel");
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "tasks" },
      (payload) => {
        const newTask = payload.new 
        console.log(newTask)
      }
    );
  } catch (error) {}
}
