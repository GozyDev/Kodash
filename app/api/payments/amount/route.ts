import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch the payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .select("amount")
      .eq("issueId", taskId)
      .eq("type", "funding")
      .eq("status", "held")
      .single();

    if (paymentError || !paymentData) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      amount: paymentData.amount,
      currency: "USD",
    });
  } catch (error) {
    console.log("Error fetching payment amount:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
