import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { redirect } from 'next/navigation';

type AnswerItem = {
  id: string;
  question_key: string;
  answer: unknown;
  question: {
    question_key: string;
    question: string;
    question_type: string;
    options: unknown;
    display_order: number;
  } | null;
};

function formatAnswer(answer: unknown): string {
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }

  if (typeof answer === 'string') {
    return answer;
  }

  if (answer === null || answer === undefined) {
    return 'No answer';
  }

  return JSON.stringify(answer, null, 2);
}

export default async function CreativeAnswersPage({
  searchParams,
}: {
  searchParams: Promise<{ access_card_id?: string }>;
}) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    redirect('/admin/login');
  }

  const { access_card_id } = await searchParams;

  if (!access_card_id) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-light italic sm:text-5xl">
            Creative Answers
          </h1>

          <p className="mt-6 text-white/50">
            No client was selected.
          </p>
        </div>
      </main>
    );
  }

  const { data: client, error: clientError } =
    await supabaseAdmin
      .from('access_cards')
      .select('id, name, email')
      .eq('id', access_card_id)
      .single();

  if (clientError || !client) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-light italic sm:text-5xl">
            Creative Answers
          </h1>

          <p className="mt-6 text-white/50">
            Client not found.
          </p>
        </div>
      </main>
    );
  }

  const { data: session, error: sessionError } =
    await supabaseAdmin
      .from('creative_sessions')
      .select('id, status, submitted_at')
      .eq('access_card_id', access_card_id)
      .single();

  if (sessionError || !session) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-light italic sm:text-5xl">
            Creative Answers
          </h1>

          <p className="mt-6 text-white/50">
            Creative Session not found.
          </p>
        </div>
      </main>
    );
  }

  const { data: answers, error: answersError } =
    await supabaseAdmin
      .from('creative_answers')
      .select(
        'id, question_key, answer, created_at, updated_at'
      )
      .eq('creative_session_id', session.id);

  if (answersError) {
    console.error(
      'ADMIN CREATIVE ANSWERS PAGE ERROR:',
      answersError
    );

    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-light italic sm:text-5xl">
            Creative Answers
          </h1>

          <p className="mt-6 text-white/50">
            Unable to load this client's answers.
          </p>
        </div>
      </main>
    );
  }

  const questionKeys = [
    ...new Set(
      (answers ?? [])
        .map((answer) => answer.question_key)
        .filter(Boolean)
    ),
  ];

  const { data: questions, error: questionsError } =
    questionKeys.length > 0
      ? await supabaseAdmin
          .from('creative_questions')
          .select(
            'question_key, question, question_type, options, display_order'
          )
          .in('question_key', questionKeys)
      : { data: [], error: null };

  if (questionsError) {
    console.error(
      'ADMIN CREATIVE QUESTIONS PAGE ERROR:',
      questionsError
    );

    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 md:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-light italic sm:text-5xl">
            Creative Answers
          </h1>

          <p className="mt-6 text-white/50">
            Unable to load the Creative Session questions.
          </p>
        </div>
      </main>
    );
  }

  const questionMap = new Map(
    (questions ?? []).map((question) => [
      question.question_key,
      question,
    ])
  );

  const combinedAnswers: AnswerItem[] = (answers ?? [])
    .map((answer) => ({
      ...answer,
      question:
        questionMap.get(answer.question_key) ?? null,
    }))
    .sort(
      (a, b) =>
        (a.question?.display_order ?? 9999) -
        (b.question?.display_order ?? 9999)
    );

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 md:px-16">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="border-b border-white/15 pb-10">
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">
            Creative Session
          </p>

          <h1 className="text-4xl font-light italic sm:text-5xl">
            {client.name || 'Client'}
          </h1>

          <p className="mt-3 text-base text-white/50">
            {client.email}
          </p>

          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/35">
            Session status: {session.status}
          </p>
        </div>

        {/* ANSWERS */}
        {combinedAnswers.length === 0 ? (
          <div className="py-16">
            <p className="text-base text-white/50">
              No answers have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {combinedAnswers.map((item, index) => (
              <section
                key={item.id}
                className="py-10 sm:py-12"
              >
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/35">
                  {String(index + 1).padStart(2, '0')}
                </p>

                <h2 className="max-w-4xl text-2xl font-light italic leading-relaxed text-white/90 sm:text-3xl">
                  {item.question?.question ||
                    item.question_key}
                </h2>

                <div className="mt-6">
                  <p className="whitespace-pre-wrap text-lg font-light leading-relaxed text-white/65 sm:text-xl">
                    {formatAnswer(item.answer)}
                  </p>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}