import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requirePrivateAccess } from "@/lib/privateAccess";

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // PRIVATE ACCESS CHECK
    // --------------------------------------------------

    const { authorized, accessCard } =
      await requirePrivateAccess();

    if (!authorized || !accessCard) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // READ REQUEST
    // --------------------------------------------------

    const body = await request.json();
    const sessionId = body?.sessionId;

    if (
      typeof sessionId !== "string" ||
      !sessionId
    ) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // GET CREATIVE SESSION
    // --------------------------------------------------

    const { data: session, error: sessionError } =
      await supabaseAdmin
        .from("creative_sessions")
        .select("id, access_card_id, status")
        .eq("id", sessionId)
        .eq("access_card_id", accessCard.id)
        .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Creative session not found" },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // SUBMITTED SESSIONS ARE ALREADY LOCKED
    // --------------------------------------------------

    if (session.status === "submitted") {
      return NextResponse.json(
        {
          error: "Creative session already submitted",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // SUBMIT CREATIVE SESSION
    // --------------------------------------------------

    const submittedAt = new Date().toISOString();

    const { error: updateError } =
      await supabaseAdmin
        .from("creative_sessions")
        .update({
          status: "submitted",
          updated_at: submittedAt,
          submitted_at: submittedAt,
        })
        .eq("id", sessionId)
        .eq("access_card_id", accessCard.id)
        .eq("status", "draft");

    if (updateError) {
      console.error(
        "CREATIVE SESSION SUBMIT ERROR:",
        updateError
      );

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
    console.error(
      "CREATIVE SUBMIT REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}