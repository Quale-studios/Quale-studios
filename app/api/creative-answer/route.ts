import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      sessionId,
      questionKey,
      answer,
    } = body;

    if (!sessionId || !questionKey || answer === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check the Creative Session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("creative_sessions")
      .select("id, status, current_question")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Creative session not found" },
        { status: 404 }
      );
    }

    // Don't allow changes after final submission
    if (session.status === "submitted") {
      return NextResponse.json(
        { error: "Creative session already submitted" },
        { status: 400 }
      );
    }

    // Save or update the answer
    const { error: answerError } = await supabaseAdmin
      .from("creative_answers")
      .upsert(
        {
          creative_session_id: sessionId,
          question_key: questionKey,
          answer: answer,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "creative_session_id,question_key",
        }
      );

    if (answerError) {
      console.error(answerError);

      return NextResponse.json(
        { error: "Failed to save answer" },
        { status: 500 }
      );
    }

    // Move to the next question
    const { error: updateError } = await supabaseAdmin
      .from("creative_sessions")
      .update({
        current_question: session.current_question + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        { error: "Answer saved, but failed to move to next question" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}