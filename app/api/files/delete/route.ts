import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const file_id = body.file_id;
    if (!file_id) {
      return NextResponse.json({ error: "file_id required" }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_UPLOAD_BUCKET || "RequestAttachment";
    const { error } = await supabase.storage.from(bucket).remove([file_id]);
    if (error) {
      console.error("Failed to delete file", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also remove any DB links (non-fatal)
    try {
      await supabase.from("task_files").delete().eq("file_id", file_id);
    } catch (e) {
      console.log("Failed to remove DB links for file", file_id, e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message || "Delete failed" }, { status: 500 });
  }
}
