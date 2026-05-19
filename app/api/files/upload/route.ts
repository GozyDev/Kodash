import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

const getMimeType = (fileName: string, fallback: string): string => {
  if (fallback && fallback !== "application/octet-stream" && fallback !== "")
    return fallback;
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };
  return map[ext ?? ""] || "application/octet-stream";
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const form = await req.formData();
    const file = form.get("file") as unknown as File;

    console.log("file name:", file?.name);
    console.log("file type:", file?.type);
    console.log("file size:", file?.size);
    console.log("is File instance:", file instanceof File);
    console.log("is Blob instance:", file instanceof Blob);

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const clientId = String(form.get("clientId") ?? "");
    const sanitized = file.name.replace(/\s+/g, "_");
    const filename = clientId
      ? `${clientId}-${sanitized}`
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${sanitized}`;
    const bucket = process.env.SUPABASE_UPLOAD_BUCKET || "RequestAttachment";

    const contentType = getMimeType(file.name, file.type);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, uint8, { contentType });

    if (uploadError) {
      console.log("Upload error, attempting fallback", uploadError.message);
      try {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filename);
        return NextResponse.json({
          file_id: filename,
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
        });
      } catch {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 },
        );
      }
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      file_id: uploadData.path,
      file_url: publicUrlData.publicUrl,
      file_name: file.name,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 500 },
    );
  }
}
