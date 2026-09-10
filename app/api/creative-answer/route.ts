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
    const questionKey = body?.questionKey;
    const answer = body?.answer;
    const continueAnyway = body?.continueAnyway === true;

    if (
      typeof sessionId !== "string" ||
      !sessionId
    ) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      );
    }

    if (
      typeof questionKey !== "string" ||
      !questionKey
    ) {
      return NextResponse.json(
        { error: "Missing question key" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // GET SESSION
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
    // GET CURRENT QUESTION
    // --------------------------------------------------

    const { data: currentQuestion, error: questionError } =
      await supabaseAdmin
        .from("creative_questions")
        .select(
          "question_key, display_order, question_type, conditions, is_active"
        )
        .eq("question_key", questionKey)
        .eq("is_active", true)
        .single();

    if (questionError || !currentQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // QUESTION MUST BE THE CURRENT QUESTION
    // --------------------------------------------------

    if (
      currentQuestion.display_order !==
      session.current_question
    ) {
      return NextResponse.json(
        { error: "Invalid question" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // GET SAVED ANSWERS
    // --------------------------------------------------

    const { data: savedAnswers, error: answersError } =
      await supabaseAdmin
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
    // SAVE CURRENT ANSWER
    // --------------------------------------------------

    const { error: upsertError } =
      await supabaseAdmin
        .from("creative_answers")
        .upsert(
          {
            creative_session_id: sessionId,
            question_key: questionKey,
            answer,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict:
              "creative_session_id,question_key",
          }
        );

    if (upsertError) {
      console.error(
        "CREATIVE ANSWER SAVE ERROR:",
        upsertError
      );

      return NextResponse.json(
        { error: "Failed to save answer" },
        { status: 500 }
      );
    }

    // Keep the new answer in memory for flow evaluation.
    answers[questionKey] = answer;

    // --------------------------------------------------
    // Q01 — BAD EXPERIENCE REST
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
    // FIND NEXT APPLICABLE QUESTION
    // --------------------------------------------------

    const nextQuestion = (questions ?? [])
      .filter(
        (question) =>
          question.display_order >
          currentQuestion.display_order
      )
      .find((question) =>
        conditionsMatch(
          question.conditions as Conditions | null,
          answers
        )
      );

    // --------------------------------------------------
    // NO NEXT QUESTION = READY TO SUBMIT
    // --------------------------------------------------

    if (!nextQuestion) {
      return NextResponse.json({
        success: true,
        readyToSubmit: true,
      });
    }

    // --------------------------------------------------
    // MOVE SESSION TO NEXT QUESTION
    // --------------------------------------------------

    const { error: updateError } =
      await supabaseAdmin
        .from("creative_sessions")
        .update({
          current_question:
            nextQuestion.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .eq("access_card_id", accessCard.id);

    if (updateError) {
      console.error(
        "CREATIVE SESSION UPDATE ERROR:",
        updateError
      );

      return NextResponse.json(
        { error: "Failed to continue session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      currentQuestion:
        nextQuestion.display_order,
      questionKey:
        nextQuestion.question_key,
    });
  } catch (error) {
    console.error(
      "CREATIVE ANSWER REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}