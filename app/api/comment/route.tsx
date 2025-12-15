import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const svc = await createClient();

  try {
    const { data: authData, error: authError } = await svc.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = authData.user;
    const { commentDraft, issueId } = await req.json();

    if (!issueId || !commentDraft?.trim()) {
      return NextResponse.json(
        { error: "Missing requirement" },
        { status: 400 }
      );
    }

    const { data, error } = await svc
      .from("comments")
      .insert({
        content: commentDraft.trim(),
        task_id: issueId,
        author_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
