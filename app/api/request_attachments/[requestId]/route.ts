import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("request_attachments")
      .select("file_url, file_type, file_size, file_name")
      .eq("request_id", requestId)
      .order("uploaded_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch attachments", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error("Unexpected error fetching attachments", e);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
