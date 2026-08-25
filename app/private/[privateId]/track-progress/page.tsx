import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function TrackProgressPage({
  params,
}: {
  params: Promise<{ privateId: string }>;
}) {
  const { privateId } = await params;

  // Find the client using their private page ID
  const { data: accessCard, error: accessError } = await supabaseAdmin
    .from("access_cards")
    .select("id, private_id, is_active")
    .eq("private_id", privateId)
    .eq("is_active", true)
    .single();

  if (accessError || !accessCard) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">Access Denied</h1>
      </main>
    );
  }

  // Load this client's progress
  const { data: progress, error: progressError } = await supabaseAdmin
    .from("track_progress")
    .select(
      "stage_order, stage_key, stage_name, status, client_message, target_date"
    )
    .eq("access_card_id", accessCard.id)
    .order("stage_order", { ascending: true });

  if (progressError) {
    console.error("TRACK PROGRESS ERROR:", progressError);

    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-5xl italic">
          Something went wrong
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-80px)] w-full overflow-x-hidden bg-black px-6 py-24 text-white sm:px-10 sm:py-28 md:px-16 md:py-32">
      <div className="mx-auto w-full max-w-5xl">

        {/* Page heading */}
        <div className="mb-20">
          <h1 className="text-4xl font-light italic sm:text-5xl md:text-6xl">
            Track Progress
          </h1>
        </div>

        {/* Progress */}
        <div className="flex flex-col">

          {progress?.map((stage, index) => (
            <div key={stage.stage_key}>

              {/* Stage */}
              <section>
                <h2
                  className={
                    stage.stage_key === "creative_materials"
                      ? "max-w-4xl text-2xl font-light italic leading-relaxed sm:text-3xl md:text-4xl"
                      : "text-2xl font-light italic sm:text-3xl md:text-4xl"
                  }
                >
                  {stage.stage_name}
                </h2>

                {/* Status */}
                <p
  className={`mt-3 text-lg font-light italic sm:text-xl md:text-2xl ${
    stage.status === "locked"
      ? "text-white/35"
      : "text-white/50"
  }`}
>
  {stage.client_message ||
    (stage.status === "completed" && "Completed") ||
    (stage.status === "preparing" && "Preparing") ||
    (stage.status === "locked" && "Locked")}
</p>
                

 

                {/* Expected date */}
                {stage.target_date && (
                  <p className="mt-2 text-base font-light italic text-white/40 sm:text-lg">
                    Expected by {stage.target_date}
                  </p>
                )}
              </section>

              {/* Connector */}
              {index < progress.length - 1 && (
                <div className="ml-1 h-20 w-px bg-white/25 sm:h-24" />
              )}

            </div>
          ))}

        </div>
      </div>
    </main>
  );
}