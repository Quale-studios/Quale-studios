import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ScrollToTop from "./ScrollToTop";
import { cookies } from "next/headers";

export default async function TrackProgressPage({
  params,
}: {
  params: Promise<{ privateId: string }>;
}) {
  const { privateId } = await params;

// --------------------------------------------------
// PRIVATE ACCESS COOKIE CHECK
// --------------------------------------------------

const cookieStore = await cookies();

const authorizedPrivateId =
  cookieStore.get("quale_private_access")?.value;

if (
  typeof authorizedPrivateId !== "string" ||
  authorizedPrivateId.length !== 64 ||
  authorizedPrivateId !== privateId
) {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-5xl italic">
        Access Denied
      </h1>
    </main>
  );
}

// --------------------------------------------------
// FIND ACTIVE ACCESS CARD
// --------------------------------------------------

const { data: accessCard, error: accessError } =
  await supabaseAdmin
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
      <ScrollToTop />
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

                    {/* Prices information */}
          <div className="mt-20 sm:mt-24 md:mt-28">
            <p className="max-w-5xl text-2xl font-light italic leading-relaxed text-white sm:text-3xl md:text-4xl">
              You can unlock (Pre-Production, Production, and Post-Production)
              by reviewing our deliverables and by paying the film's,
            </p>

            <p className="mt-8 max-w-5xl text-xl font-light italic leading-relaxed text-white/40 sm:text-2xl md:text-3xl">
              (which you selected in the Creative Session, e.g., Brand Film,
              Product Film, Ad Film, or Corporate Film)...
            </p>

            <div className="mt-16 flex justify-end sm:mt-20 md:mt-24">
              <a
                href="/prices"
                className="group relative inline-block text-2xl font-light italic text-white sm:text-3xl md:text-4xl"
              >
                <span className="relative inline-block">
                  Prices

                  <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </main>
  );
}