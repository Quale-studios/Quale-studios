import { requireAdmin } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { redirect } from 'next/navigation';
import AdminProgressEditor from './AdminProgressEditor';

export default async function AdminPage() {
  const { authorized } = await requireAdmin();

  if (!authorized) {
    redirect('/admin/login');
  }

  const { data: accessCards, error: accessCardsError } = await supabaseAdmin
    .from('access_cards')
    .select('id, name, email, private_id, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (accessCardsError) {
    console.error('ADMIN ACCESS CARDS ERROR:', accessCardsError);

    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-light italic sm:text-5xl">
            Admin
          </h1>

          <p className="mt-6 text-sm text-white/50">
            Unable to load clients.
          </p>
        </div>
      </main>
    );
  }

  const { data: progress, error: progressError } = await supabaseAdmin
    .from('track_progress')
    .select(
      'id, access_card_id, stage_key, stage_name, stage_order, status, client_message, target_date'
    )
    .order('stage_order', { ascending: true });

  if (progressError) {
    console.error('ADMIN TRACK PROGRESS ERROR:', progressError);

    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-4xl font-light italic sm:text-5xl">
            Admin
          </h1>

          <p className="mt-6 text-sm text-white/50">
            Unable to load progress.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white sm:px-10 sm:py-28 md:px-16 md:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-16">
          <h1 className="text-4xl font-light italic sm:text-5xl md:text-6xl">
            Admin
          </h1>

          <p className="mt-4 text-sm text-white/40">
            Manage client progress.
          </p>
        </div>

        <AdminProgressEditor
          accessCards={accessCards ?? []}
          progress={progress ?? []}
        />
      </div>
    </main>
  );
}