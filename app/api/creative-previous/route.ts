import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requirePrivateAccess } from "@/lib/privateAccess";

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
  if (!conditions) {
    return true;
  }

  if (conditions.all) {
    const allMatch = conditions.all.every((condition) => {
      const answer = answers[condition.question];

      return answerContains(answer, condition.contains);
    });

    if (!allMatch) {
      return false;
    }
  }

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
        .select(
          "id, access_card_id, current_question, status"
        )
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
    // SUBMITTED SESSIONS ARE LOCKED
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
    // NEVER GO BEFORE Q1
    // --------------------------------------------------

    if (session.current_question <= 1) {
      return NextResponse.json({
        success: true,
        currentQuestion: 1,
      });
    }

    // --------------------------------------------------
    // GET EVERY SAVED ANSWER
    // --------------------------------------------------

    const {
      data: savedAnswers,
      error: answersError,
    } = await supabaseAdmin
      .from("creative_answers")
      .select("question_key, answer")
      .eq("creative_session_id", sessionId);

    if (answersError) {
      console.error(
        "CREATIVE ANSWERS LOAD ERROR:",
        answersError
      );

      return NextResponse.json(
        { error: "Failed to load session answers" },
        { status: 500 }
      );
    }

    const answers: Record<string, unknown> = {};

    for (const savedAnswer of savedAnswers ?? []) {
      answers[savedAnswer.question_key] =
        savedAnswer.answer;
    }

    // --------------------------------------------------
    // GET ALL ACTIVE QUESTIONS
    // --------------------------------------------------

    const {
      data: questions,
      error: questionsError,
    } = await supabaseAdmin
      .from("creative_questions")
      .select(
        "question_key, display_order, conditions, is_active"
      )
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

    if (questionsError) {
      console.error(
        "CREATIVE QUESTIONS LOAD ERROR:",
        questionsError
      );

      return NextResponse.json(
        { error: "Failed to load creative questions" },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // FIND CLOSEST APPLICABLE PREVIOUS QUESTION
    // --------------------------------------------------

    const previousQuestion = (questions ?? [])
      .filter(
        (question) =>
          question.display_order <
          session.current_question
      )
      .reverse()
      .find((question) =>
        conditionsMatch(
          question.conditions as Conditions | null,
          answers
        )
      );

    // --------------------------------------------------
    // NOTHING APPLICABLE BEFORE THIS QUESTION
    // --------------------------------------------------

    if (!previousQuestion) {
      return NextResponse.json({
        success: true,
        currentQuestion: 1,
      });
    }

    // --------------------------------------------------
    // MOVE SESSION BACKWARD
    // --------------------------------------------------

    const { error: updateError } =
      await supabaseAdmin
        .from("creative_sessions")
        .update({
          current_question:
            previousQuestion.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .eq("access_card_id", accessCard.id);

    if (updateError) {
      console.error(
        "CREATIVE SESSION PREVIOUS UPDATE ERROR:",
        updateError
      );

      return NextResponse.json(
        { error: "Failed to go to previous question" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      currentQuestion:
        previousQuestion.display_order,
      questionKey:
        previousQuestion.question_key,
    });
  } catch (error) {
    console.error(
      "CREATIVE PREVIOUS REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}