import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const form = await req.formData();
    const file = form.get("file") as unknown as File;
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Use client-provided id when present so retries/duplicates map to same path
    const clientId = String(form.get("clientId") ?? "");
    const sanitized = file.name.replace(/\s+/g, "_");
    const filename = clientId ? `${clientId}-${sanitized}` : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${sanitized}`;
    const bucket = process.env.SUPABASE_UPLOAD_BUCKET || "RequestAttachment";

    // Try upload. If object already exists, return existing path instead of creating duplicate
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, uint8, { contentType: file.type });

    if (uploadError) {
      // If file exists or other error, attempt to return public URL for the path
      console.log("Upload error, attempting fallback", uploadError.message);
      try {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename);
        return NextResponse.json({ file_id: filename, file_url: publicUrlData.publicUrl });
      } catch (e) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);

    return NextResponse.json({ file_id: uploadData.path, file_url: publicUrlData.publicUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message || "Upload failed" }, { status: 500 });
  }
}
