import { createClient } from "@/lib/superbase/superbase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const { dod, price, requestId, deadline } = await req.json();

    console.log(dod,price,requestId,deadline)
    // Hard validation
    if (!dod || !price || !requestId || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },   
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("request_proposal")
      .insert([
        {
          dod,
          price,
          request_id: requestId,
          due_date: deadline,
        },
      ])
      .select("id, dod, price, request_id, due_date")
      .single();

    if (error) {
      console.error("Create proposal error:", error);
      return NextResponse.json(
        { error: "Failed to create proposal" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
