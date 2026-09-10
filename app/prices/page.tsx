import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function PricesPage() {
  const cookieStore = await cookies();
  const privateId = cookieStore.get("quale_private_access")?.value;

  let authorized = false;

  if (privateId) {
    const { data: accessCard, error } = await supabaseAdmin
      .from("access_cards")
      .select("id")
      .eq("private_id", privateId)
      .eq("is_active", true)
      .single();

    if (!error && accessCard) {
      authorized = true;
    }
  }

if (!authorized) {
  return (
    <main className="min-h-[calc(100svh-80px)] bg-black text-white">
      <section className="relative flex min-h-[calc(100svh-80px)] items-center px-[8%] py-[10vh] sm:px-[9%] md:px-[10%] lg:px-[11%]">
        <div className="relative flex min-h-[70vh] w-full max-w-[1250px] flex-col justify-center">
          {/* INTRO */}
          <p className="max-w-[1050px] text-[25px] italic leading-[1.25] text-white/50 sm:text-[29px] md:text-[34px] lg:text-[40px]">
            Prices will not be shown until you have these:
          </p>

          {/* DELIVERABLES */}
          <div className="mt-[5vh] space-y-0">
            <p className="text-[27px] italic leading-[1.25] sm:text-[31px] md:text-[36px] lg:text-[42px]">
              Story Concepts (Two)
            </p>

            <p className="text-[27px] italic leading-[1.25] sm:text-[31px] md:text-[36px] lg:text-[42px]">
              Story explanations
            </p>

            <p className="text-[27px] italic leading-[1.25] sm:text-[31px] md:text-[36px] lg:text-[42px]">
              Rough script based on story (Two)
            </p>
          </div>

          {/* CLOSING */}
          <p className="mt-[5vh] max-w-[1050px] text-[25px] italic leading-[1.25] text-white/50 sm:text-[29px] md:text-[34px] lg:text-[40px]">
            And we can deliver these based on your business,
            <br className="hidden sm:block" />
            only once you take your...
          </p>

          {/* ACCESS CARD BUTTON */}
          <div className="mt-[5vh] flex justify-end">
            <a
              href="/access-card"
              className="group relative inline-block text-[27px] italic leading-none sm:text-[31px] md:text-[36px] lg:text-[42px]"
            >
              Access Card

              <span className="absolute -bottom-2 left-0 h-px w-0 bg-white transition-all duration-500 ease-out group-hover:w-full" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

  return (
    <main className="bg-black text-white">
      {/* SECTION 1 — FILM PRICES */}
      <section className="flex min-h-[calc(100svh-80px)] items-center bg-black px-[8%] py-[10vh] sm:px-[9%] md:px-[10%] lg:px-[10%]">
        <div className="max-w-[1250px] max-sm:-translate-y-[2.5vh]">
          <p className="max-w-[1180px] text-[27px] italic leading-[1.28] text-white/50 sm:text-[31px] md:text-[36px] lg:text-[42px]">
  World wants to Quale your business films. To make these films,
  explore the prices listed below:
</p>

          <div className="mt-16 space-y-5 sm:mt-20 sm:space-y-7 md:mt-24">
            <p className="text-[28px] italic leading-[1.15] sm:text-[32px] md:text-[38px] lg:text-[43px]">
  Brand Film{" "}
  <span className="text-white/50">starts from</span>{" "}
  ₹1 lakh ($1,200)
</p>

<p className="text-[28px] italic leading-[1.15] sm:text-[32px] md:text-[38px] lg:text-[43px]">
  Product Film{" "}
  <span className="text-white/50">starts from</span>{" "}
  ₹1 lakh ($1,200)
</p>

<p className="text-[28px] italic leading-[1.15] sm:text-[32px] md:text-[38px] lg:text-[43px]">
  Corporate Film{" "}
  <span className="text-white/50">starts from</span>{" "}
  ₹1 lakh ($1,200)
</p>

<p className="text-[28px] italic leading-[1.15] sm:text-[32px] md:text-[38px] lg:text-[43px]">
  Advertisement Film{" "}
  <span className="text-white/50">starts from</span>{" "}
  ₹1 lakh ($1,200)
</p>
          </div>

          <p className="mt-[6vh] max-w-[1180px] text-[24px] italic leading-[1.25] text-white/50 sm:mt-[6.5vh] sm:text-[28px] md:mt-[9vh] md:text-[34px] lg:text-[40px]">
  These are approximate prices; actual prices will be based on your
  project.
</p>
        </div>
      </section>

      {/* SECTION 2 — PAYMENT STRUCTURE */}
     <section className="flex min-h-[calc(100svh-80px)] items-center bg-black px-[8%] py-[10vh] sm:px-[9%] md:px-[10%] lg:px-[10%]">
        <div className="max-w-[1250px] max-sm:-translate-y-[2.5vh]">
          <p className="max-w-[1180px] text-[27px] italic leading-[1.28] text-white/50 sm:text-[31px] md:text-[36px] lg:text-[42px]">
  And you can easily pay the amount like this:
</p>

          <div className="mt-16 space-y-6 sm:mt-20 sm:space-y-8 md:mt-24">
            <p className="text-[28px] italic leading-[1.15] sm:text-[32px] md:text-[38px] lg:text-[43px]">
  45% <span className="text-white/50">before</span> Pre-Production
</p>

<p className="text-[28px] italic leading-[1.15] sm:text-[32px] md:text-[38px] lg:text-[43px]">
  35% <span className="text-white/50">before</span> Production
</p>

<p className="text-[28px] italic leading-[1.15] sm:text-[32px] md:text-[38px] lg:text-[43px]">
  20% <span className="text-white/50">before</span> Post-Production
</p>
          </div>

          <p className="mt-[6vh] max-w-[1180px] text-[24px] italic leading-[1.25] text-white/50 sm:mt-[6.5vh] sm:text-[28px] md:mt-[9vh] md:text-[34px] lg:text-[40px]">
  Only after reviewing our deliverables (Story Concepts, Story
  Explanations, Rough Scripts), with the actual price based on your
  project.
</p>
        </div>
      </section>
    </main>
  );
}