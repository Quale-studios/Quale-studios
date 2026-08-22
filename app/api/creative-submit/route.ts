import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // Get the Creative Session
    const { data: session, error: sessionError } =
      await supabaseAdmin
        .from("creative_sessions")
        .select("id, status")
        .eq("id", sessionId)
        .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Creative session not found" },
        { status: 404 }
      );
    }

    // Don't allow a second submission
    if (session.status === "submitted") {
      return NextResponse.json(
        { error: "Creative session already submitted" },
        { status: 400 }
      );
    }

    // Final submission
    const { error: updateError } =
      await supabaseAdmin
        .from("creative_sessions")
        .update({
          status: "submitted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        { error: "Failed to submit creative session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submitted: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}