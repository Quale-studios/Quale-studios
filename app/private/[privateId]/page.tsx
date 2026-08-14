import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function PrivatePage({
  params,
}: {
  params: Promise<{ privateId: string }>;
}) {
  const { privateId } = await params;

  const { data: accessCard, error } = await supabaseAdmin
    .from("access_cards")
    .select("name, business_name, email, private_id")
    .eq("private_id", privateId)
    .single();

  if (error || !accessCard) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <h1 className="font italic text-5xl">
            Access Denied
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="font italic text-5xl">
          Welcome, {accessCard.name}
        </h1>

        <p className="mt-4 font italic text-2xl">
          {accessCard.business_name}
        </p>

        <p className="mt-2 text-sm text-white/60">
          {accessCard.private_id}
        </p>
      </div>
    </main>
  );
}