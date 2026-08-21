import { supabaseAdmin } from "@/lib/supabaseAdmin";
import QuestionForm from "./QuestionForm";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ privateId: string }>;
}) {
  const { privateId } = await params;

  // Find the client
  const { data: accessCard, error: accessError } = await supabaseAdmin
    .from("access_cards")
    .select("id, name, private_id")
    .eq("private_id", privateId)
    .eq("is_active", true)
    .single();

  if (accessError || !accessCard) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">
          Access Denied
        </h1>
      </main>
    );
  }

  // Find their Creative Session
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("creative_sessions")
    .select("id, status, current_question")
    .eq("access_card_id", accessCard.id)
    .single();

  if (sessionError || !session) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">
          Creative Session not found
        </h1>
      </main>
    );
  }

  // Load the current question
  const { data: question, error: questionError } = await supabaseAdmin
    .from("creative_questions")
    .select("question_key, question, question_type, options")
    .eq("display_order", session.current_question)
    .eq("is_active", true)
    .single();

  if (questionError || !question) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">
          Question not found
        </h1>
      </main>
    );
  }

  return (
  <main className="min-h-[calc(100dvh-80px)] w-full bg-black text-white">
    <QuestionForm
    key={question.question_key}
      sessionId={session.id}
      questionKey={question.question_key}
      question={question.question}
      questionType={question.question_type}
      options={question.options}
      currentQuestion={session.current_question}
      sessionStatus={session.status}
    />
  </main>
);
}