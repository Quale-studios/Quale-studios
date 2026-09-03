import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const accessCardId = searchParams.get('access_card_id');

  if (!accessCardId) {
    return NextResponse.json(
      { error: 'Access card ID is required.' },
      { status: 400 }
    );
  }

  // Confirm the access card exists.
  const { data: accessCard, error: accessCardError } =
    await supabaseAdmin
      .from('access_cards')
      .select('id, name, email')
      .eq('id', accessCardId)
      .single();

  if (accessCardError || !accessCard) {
    return NextResponse.json(
      { error: 'Client not found.' },
      { status: 404 }
    );
  }

  // Find the client's Creative Session.
  const { data: session, error: sessionError } =
    await supabaseAdmin
      .from('creative_sessions')
      .select('id, status, submitted_at')
      .eq('access_card_id', accessCardId)
      .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Creative Session not found.' },
      { status: 404 }
    );
  }

  // Get all answers belonging to this session.
  const { data: answers, error: answersError } =
    await supabaseAdmin
      .from('creative_answers')
      .select(
        'id, question_key, answer, created_at, updated_at'
      )
      .eq('creative_session_id', session.id);

  if (answersError) {
    console.error(
      'ADMIN CREATIVE ANSWERS ERROR:',
      answersError
    );

    return NextResponse.json(
      { error: 'Unable to load creative answers.' },
      { status: 500 }
    );
  }

  const questionKeys = [
    ...new Set(
      (answers ?? [])
        .map((answer) => answer.question_key)
        .filter(Boolean)
    ),
  ];

  if (questionKeys.length === 0) {
    return NextResponse.json({
      success: true,
      client: accessCard,
      session: {
        id: session.id,
        status: session.status,
        submitted_at: session.submitted_at,
      },
      answers: [],
    });
  }

  // Load the exact questions answered by this client.
  // We intentionally do not filter by is_active so that
  // historical answers remain readable if a question is
  // later disabled.
  const { data: questions, error: questionsError } =
    await supabaseAdmin
      .from('creative_questions')
      .select(
        'question_key, question, question_type, options, display_order'
      )
      .in('question_key', questionKeys);

  if (questionsError) {
    console.error(
      'ADMIN CREATIVE QUESTIONS ERROR:',
      questionsError
    );

    return NextResponse.json(
      { error: 'Unable to load creative questions.' },
      { status: 500 }
    );
  }

  const questionMap = new Map(
    (questions ?? []).map((question) => [
      question.question_key,
      question,
    ])
  );

  const combinedAnswers = (answers ?? [])
    .map((answer) => ({
      ...answer,
      question: questionMap.get(answer.question_key) ?? null,
    }))
    .sort(
      (a, b) =>
        (a.question?.display_order ?? 9999) -
        (b.question?.display_order ?? 9999)
    );

  return NextResponse.json({
    success: true,
    client: accessCard,
    session: {
      id: session.id,
      status: session.status,
      submitted_at: session.submitted_at,
    },
    answers: combinedAnswers,
  });
}