import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const svc = await createClient();

  const { searchParams } = new URL(req.url);
  const issueId = searchParams.get("issueId");

  if (!issueId) {
    return NextResponse.json({ error: "Missing issueId" }, { status: 400 });
  }

  const { data, error } = await svc
    .from("comments")
    .select(
      `
      id,
      content,
      created_at,
      attachment_url,
      author:profiles (
        id,
       full_name,
        avatar_url
      )
    `
    )
    .eq("task_id", issueId)
    .order("created_at", { ascending: true });

  if (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }

  return NextResponse.json({ comments: data }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const svc = await createClient();

  try {
    const { data: authData, error: authError } = await svc.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = authData.user;
    // Support multipart/form-data (file upload) as well as JSON payloads.
    let commentDraft: string | null = null;
    let issueId: string | null = null;
    let attachmentUrl: string | null = null;
    let uploadedPath: string | null = null;

    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const form = await req.formData();
        commentDraft = String(form.get("commentDraft") ?? "");
        issueId = String(form.get("issueId") ?? "");
        const file = form.get("file") as File | null;

        if (file && (file as unknown as { size?: number }).size) {
          const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
          const path = `comments/${filename}`;
          const buffer = await file.arrayBuffer();
          const { error: uploadError } = await svc.storage
            .from("comments")
            .upload(path, new Uint8Array(buffer), { contentType: file.type });

          if (uploadError) throw uploadError;

          const { data: pub } = svc.storage.from("comments").getPublicUrl(path);
          attachmentUrl = pub?.publicUrl ?? null;
          uploadedPath = path;
        }
      } else {
        const body = await req.json();
        commentDraft = body.commentDraft ?? null;
        issueId = body.issueId ?? null;
        attachmentUrl = body.attachmentUrl ?? null;
      }

      if (!issueId || !commentDraft?.trim()) {
        return NextResponse.json({ error: "Missing requirement" }, { status: 400 });
      }

      const { data, error } = await svc
        .from("comments")
        .insert({
          content: commentDraft.trim(),
          task_id: issueId,
          author_id: user.id,
          attachment_url: attachmentUrl ?? null,
        })
        .select(
          `  id,
        content,
        created_at,
        attachment_url,
        author:profiles (
          id,
         full_name,
          avatar_url
        )`
        )
        .single();

      if (error) {
        // cleanup uploaded file on failure
        if (uploadedPath) await svc.storage.from("comments").remove([uploadedPath]);
        console.error(error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
      }

      return NextResponse.json({ comment: data }, { status: 201 });
    } catch (err) {
      // ensure cleanup if something went wrong after upload
      console.error(err);
      return NextResponse.json({ error: "Upload/create failed" }, { status: 500 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
