import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const ALLOWED_STATUSES = [
  'completed',
  'preparing',
  'no_action_needed',
  'locked',
];

export async function PATCH(request: Request) {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let body: {
    id?: unknown;
    status?: unknown;
    client_message?: unknown;
    target_date?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  if (typeof body.id !== 'string' || !body.id.trim()) {
    return NextResponse.json(
      { error: 'Progress row ID is required.' },
      { status: 400 }
    );
  }

  if (
    typeof body.status !== 'string' ||
    !ALLOWED_STATUSES.includes(body.status)
  ) {
    return NextResponse.json(
      { error: 'Invalid progress status.' },
      { status: 400 }
    );
  }

  if (
    body.client_message !== null &&
    body.client_message !== undefined &&
    (
      typeof body.client_message !== 'string' ||
      body.client_message.length > 500
    )
  ) {
    return NextResponse.json(
      { error: 'Invalid client message.' },
      { status: 400 }
    );
  }

  if (
    body.target_date !== null &&
    body.target_date !== undefined &&
    (
      typeof body.target_date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(body.target_date)
    )
  ) {
    return NextResponse.json(
      { error: 'Invalid target date.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('track_progress')
    .update({
      status: body.status,
      client_message:
        body.client_message === undefined
          ? null
          : body.client_message,
      target_date:
        body.target_date === undefined
          ? null
          : body.target_date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select(
      'id, access_card_id, stage_key, stage_name, stage_order, status, client_message, target_date, updated_at'
    )
    .single();

  if (error) {
    console.error('ADMIN TRACK PROGRESS UPDATE ERROR:', error);

    return NextResponse.json(
      { error: 'Unable to update progress.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    progress: data,
  });
}