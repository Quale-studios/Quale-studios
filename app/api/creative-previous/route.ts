import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Condition = {
  question: string;
  contains: string;
};

type Conditions = {
  all?: Condition[];
  any?: Condition[];
};

function answerContains(answer: unknown, value: string) {
  if (Array.isArray(answer)) {
    return answer.includes(value);
  }

  if (typeof answer === "string") {
    return answer === value;
  }

  return false;
}

function conditionsMatch(
  conditions: Conditions | null,
  answers: Record<string, unknown>
) {
  // No conditions = normal/main question
  if (!conditions) {
    return true;
  }

  // ALL conditions must be true
  if (conditions.all) {
    const allMatch = conditions.all.every((condition) => {
      const answer = answers[condition.question];

      return answerContains(answer, condition.contains);
    });

    if (!allMatch) {
      return false;
    }
  }

  // ANY condition can be true
  if (conditions.any) {
    const anyMatch = conditions.any.some((condition) => {
      const answer = answers[condition.question];

      return answerContains(answer, condition.contains);
    });

    if (!anyMatch) {
      return false;
    }
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Get Creative Session
    // --------------------------------------------------

    const { data: session, error: sessionError } =
      await supabaseAdmin
        .from("creative_sessions")
        .select("id, current_question, status")
        .eq("id", sessionId)
        .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Creative session not found" },
        { status: 404 }
      );
    }

    if (session.status === "submitted") {
      return NextResponse.json(
        { error: "Creative session already submitted" },
        { status: 400 }
      );
    }

    // Never go before Q1
    if (session.current_question <= 1) {
      return NextResponse.json({
        success: true,
        currentQuestion: 1,
      });
    }

    // --------------------------------------------------
    // Get every saved answer
    // --------------------------------------------------

    const { data: savedAnswers, error: answersError } =
      await supabaseAdmin
        .from("creative_answers")
        .select("question_key, answer")
        .eq("creative_session_id", sessionId);

    if (answersError) {
      console.error(answersError);

      return NextResponse.json(
        { error: "Failed to load session answers" },
        { status: 500 }
      );
    }

    const answers: Record<string, unknown> = {};

    for (const savedAnswer of savedAnswers ?? []) {
      answers[savedAnswer.question_key] = savedAnswer.answer;
    }

    // --------------------------------------------------
    // Get all active questions
    // --------------------------------------------------

    const { data: questions, error: questionsError } =
      await supabaseAdmin
        .from("creative_questions")
        .select(
          "question_key, display_order, conditions, is_active"
        )
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (questionsError) {
      console.error(questionsError);

      return NextResponse.json(
        { error: "Failed to load creative questions" },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Find closest applicable previous question
    // --------------------------------------------------

    const previousQuestion = (questions ?? [])
      .filter(
        (question) =>
          question.display_order < session.current_question
      )
      .reverse()
      .find((question) =>
        conditionsMatch(
          question.conditions as Conditions | null,
          answers
        )
      );

    // --------------------------------------------------
    // Nothing applicable before this question
    // --------------------------------------------------

    if (!previousQuestion) {
      return NextResponse.json({
        success: true,
        currentQuestion: 1,
      });
    }

    // --------------------------------------------------
    // Move session backward
    // --------------------------------------------------

    const { error: updateError } = await supabaseAdmin
      .from("creative_sessions")
      .update({
        current_question: previousQuestion.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error(updateError);

      return NextResponse.json(
        { error: "Failed to go to previous question" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      currentQuestion: previousQuestion.display_order,
      questionKey: previousQuestion.question_key,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}