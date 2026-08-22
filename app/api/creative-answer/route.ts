import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Condition = {
  question: string;
  contains: string;
};

type Conditions = {
  all?: (Condition | Conditions)[];
  any?: (Condition | Conditions)[];
};

function answerContains(answer: unknown, value: string): boolean {
  if (Array.isArray(answer)) {
    return answer.includes(value);
  }

  if (typeof answer === "string") {
    return answer === value;
  }

  return false;
}

function conditionsMatch(
  condition: Condition | Conditions | null,
  answers: Record<string, unknown>
): boolean {
  // No condition = always visible
  if (!condition) {
    return true;
  }

  // Simple condition:
  // { question: "q08", contains: "product_film" }
  if ("question" in condition && "contains" in condition) {
    return answerContains(
      answers[condition.question],
      condition.contains
    );
  }

  // ALL conditions must match
  if ("all" in condition && Array.isArray(condition.all)) {
    return condition.all.every((item) =>
      conditionsMatch(item, answers)
    );
  }

  // ANY condition can match
  if ("any" in condition && Array.isArray(condition.any)) {
    return condition.any.some((item) =>
      conditionsMatch(item, answers)
    );
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      sessionId,
      questionKey,
      answer,
      continueAnyway,
    } = body;

    if (!sessionId || !questionKey || answer === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Get Creative Session
    // --------------------------------------------------

    const { data: session, error: sessionError } =
      await supabaseAdmin
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

    // --------------------------------------------------
    // Save / update answer
    // --------------------------------------------------

    const { error: answerError } = await supabaseAdmin
      .from("creative_answers")
      .upsert(
        {
          creative_session_id: sessionId,
          question_key: questionKey,
          answer,
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

    // --------------------------------------------------
    // Q01 + Bad = Rest screen
    // --------------------------------------------------

    if (
      questionKey === "q01" &&
      answer === "bad" &&
      !continueAnyway
    ) {
      return NextResponse.json({
        success: true,
        needsRest: true,
      });
    }

    // --------------------------------------------------
    // Get every answer belonging to this session
    // --------------------------------------------------

    const { data: savedAnswers, error: answersError } =
      await supabaseAdmin
        .from("creative_answers")
        .select("question_key, answer")
        .eq("creative_session_id", sessionId);

    if (answersError) {
      console.error(answersError);

      return NextResponse.json(
        { error: "Failed to load saved answers" },
        { status: 500 }
      );
    }

    const answers: Record<string, unknown> = {};

    for (const savedAnswer of savedAnswers ?? []) {
      answers[savedAnswer.question_key] = savedAnswer.answer;
    }

    // Make absolutely sure the answer we just saved is included
    answers[questionKey] = answer;

    // --------------------------------------------------
    // Find the next question whose conditions match
    // --------------------------------------------------

    const { data: questions, error: questionsError } =
      await supabaseAdmin
        .from("creative_questions")
        .select(
          "question_key, display_order, conditions, is_active"
        )
        .eq("is_active", true)
        .gt("display_order", session.current_question)
        .order("display_order", { ascending: true });

    if (questionsError) {
      console.error(questionsError);

      return NextResponse.json(
        { error: "Failed to find next question" },
        { status: 500 }
      );
    }

    const nextQuestion = (questions ?? []).find((candidate) => {
      return conditionsMatch(
        candidate.conditions as Conditions | null,
        answers
      );
    });

    // --------------------------------------------------
    // No more applicable questions
    // --------------------------------------------------

   if (!nextQuestion) {
  return NextResponse.json({
    success: true,
    readyToSubmit: true,
    currentQuestion: session.current_question,
  });
}

    // --------------------------------------------------
    // Move session to next applicable question
    // --------------------------------------------------

    const { error: updateError } = await supabaseAdmin
      .from("creative_sessions")
      .update({
        current_question: nextQuestion.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        {
          error:
            "Answer saved, but failed to move to next question",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      currentQuestion: nextQuestion.display_order,
      questionKey: nextQuestion.question_key,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}