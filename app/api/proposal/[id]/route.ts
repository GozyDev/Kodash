import { NextResponse } from "next/server";
import { createClient } from "@/lib/superbase/superbase-server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const issueId = params.id;

    const { data, error } = await supabase
      .from("request_proposal")
      .select("id, price, currency, due_date, dod")
      .eq("request_id", issueId)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const proposal = data && data.length > 0 ? data[0] : null;

    return NextResponse.json({ proposal });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
