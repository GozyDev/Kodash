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
    const rawFile = form.get("file");
    const isBlob =
      typeof rawFile === "object" && rawFile !== null && rawFile instanceof Blob;
    const isFile =
      typeof rawFile === "object" && rawFile !== null && rawFile instanceof File;
    const file = isBlob ? rawFile : null;

    console.log("file name:", isFile ? rawFile.name : "unknown");
    console.log("file type:", file?.type);
    console.log("file size:", file?.size);
    console.log("is File instance:", isFile);
    console.log("is Blob instance:", isBlob);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const clientId = String(form.get("clientId") ?? "");
    const originalName = isFile ? rawFile.name : `blob_${Date.now()}`;
    const sanitized = originalName.replace(/\s+/g, "_");
    const filename = clientId
      ? `${clientId}-${sanitized}`
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${sanitized}`;
    const bucket = process.env.SUPABASE_UPLOAD_BUCKET || "RequestAttachment";

    const contentType = getMimeType(originalName, file.type);

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
          file_name: originalName,
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
      file_name: originalName,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 500 },
    );
  }
}
