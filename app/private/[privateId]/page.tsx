import { supabaseAdmin } from "@/lib/supabaseAdmin";
import ScrollPosition from "./ScrollPosition";
import Link from "next/link";


export default async function PrivatePage({
  params,
}: {
  params: Promise<{ privateId: string }>;
}) {
  const { privateId } = await params;

  const { data: accessCard, error } = await supabaseAdmin
  .from("access_cards")
  .select("id, name, business_name, private_id, is_active")
  .eq("private_id", privateId)
  .eq("is_active", true)
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

  let { data: creativeSession } = await supabaseAdmin
  .from("creative_sessions")
  .select("id, status, current_question")
  .eq("access_card_id", accessCard.id)
  .single();

if (!creativeSession) {
  const { data: newSession, error: sessionError } = await supabaseAdmin
    .from("creative_sessions")
    .insert({
      access_card_id: accessCard.id,
    })
    .select("id, status, current_question")
    .single();

  if (sessionError || !newSession) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <h1 className="font italic text-5xl">
            Something went wrong
          </h1>
        </div>
      </main>
    );
  }

  creativeSession = newSession;
}

  return (
  <main className="min-h-screen bg-black text-white">
    <ScrollPosition />
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      
      {/* Cinematic studio light */}
      

      {/* Welcome text */}
      <div className="relative z-10 text-center">
  <h1 className="relative inline-block overflow-visible font italic text-4xl sm:text-5xl md:text-8xl">

  <span className="relative z-10">
    Welcome {accessCard.name}
  </span>

  <span className="studio-light" />

</h1>
  <p className="mt-3 font italic text-lg sm:text-xl md:text-4xl">
    In your creative world
  </p>
</div>
     <style>{`
  .studio-light {
  position: absolute;

  width: 280px;
  height: 280px;

  top: 50%;
  left: -100px;

  transform: translateY(-50%);

  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.40) 0%,
    rgba(255, 255, 255, 0.12) 25%,
    rgba(255, 255, 255, 0.03) 55%,
    transparent 100%
  );

  filter: blur(15px);

  opacity: 0;

  pointer-events: none;

  z-index: 0;

  animation:
    lightFadeIn 1s ease-out forwards,
    lightMove 6s ease-in-out 1s forwards;
}

@keyframes lightFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes lightMove {
  from {
    left: -100px;
  }

  to {
    left: calc(100% - 140px);
  }
}
  @media (max-width: 640px) {
  .studio-light {
    width: 180px;
    height: 180px;

    filter: blur(12px);
  }

  @keyframes lightMove {
    from {
      left: -70px;
    }

    to {
      left: calc(100% - 90px);
    }
  }
}
`}</style>
    </section>

     {/* SECTION 02 — YOUR WORLD */}
<section className="relative flex min-h-[65vh] items-center overflow-hidden bg-black text-white lg:min-h-screen">
  <div className="w-full">

    {/* LINE 1 */}
    <p
      className="
        absolute
        left-[8%]
        top-[32%]
        font
        italic
        text-[29px]
        leading-none
        text-white

        sm:left-[10%]
        sm:top-[34%]
        sm:text-[32px]

        lg:left-[12%]
        lg:top-[37%]
        lg:text-[48px]

        xl:left-[17%]
        xl:top-[38%]
        xl:text-[72px]
      "
    >
      Your world is ready to
    </p>


    {/* LINE 2 */}
    <p
      className="
        absolute
        left-[18%]
        top-[39%]
        font
        italic
        text-[29px]
        leading-none
        text-white/45

        sm:left-[20%]
        sm:top-[43%]
        sm:text-[32px]

        lg:left-[25%]
        lg:top-[45%]
        lg:text-[48px]

        xl:left-[29%]
        xl:top-[46%]
        xl:text-[72px]
      "
    >
      create your business films,
    </p>


    {/* LINE 3 */}
    <p
      className="
        absolute
        left-[8%]
        top-[46%]
        font
        italic
        text-[29px]
        leading-none
        text-white

        sm:left-[10%]
        sm:top-[52%]
        sm:text-[32px]

        lg:left-[12%]
        lg:top-[53%]
        lg:text-[48px]

        xl:left-[17%]
        xl:top-[54%]
        xl:text-[72px]
      "
    >
      but to create your films,
    </p>


    {/* LINE 4 */}
    <p
      className="
        absolute
        left-[18%]
        top-[53%]
        font
        italic
        text-[29px]
        leading-none
        text-white/45

        sm:left-[20%]
        sm:top-[61%]
        sm:text-[32px]

        lg:left-[25%]
        lg:top-[61%]
        lg:text-[48px]

        xl:left-[29%]
        xl:top-[62%]
        xl:text-[72px]
      "
    >
      we need to understand your business.
    </p>

  </div>

</section>

{/* SECTION 3 */}
<section className="relative flex min-h-[65vh] items-center overflow-hidden bg-black text-white lg:min-h-screen">
  <div className="w-full">

    {/* TOP LINE */}
    <p
      className="
        absolute

        /* PHONE */
        left-[7%]
        top-[36%]
        text-[28px]

        /* IPAD */
        md:left-[12%]
        md:top-[38%]
        md:text-[48px]

        /* DESKTOP */
        lg:left-[17%]
        lg:top-[38%]
        lg:text-[72px]

        font
        italic
        leading-none
        text-white/45
      "
    >
      With some questions and answers,
    </p>


    {/* MAIN QUESTION */}
    <p
      className="
        absolute

        /* PHONE */
        left-[9%]
        top-[44%]
        text-[28px]

        /* IPAD */
        md:left-[20%]
        md:top-[48%]
        md:text-[48px]

        /* DESKTOP */
        lg:left-[29%]
        lg:top-[48%]
        lg:text-[72px]

        font
        italic
        leading-none
        text-white
      "
    >
      Would you like to start creating?
    </p>


    {/* YES BUTTON */}
    {/* YES BUTTON */}
<Link
  href={`/private/${privateId}/session`}
 className="
        group
        absolute

        /* PHONE */
        left-[26%]
        top-[57%]
        text-[32px]

        /* IPAD */
        md:left-[43%]
        md:top-[58%]
        md:text-[48px]

        /* DESKTOP */
        lg:left-[59%]
        lg:top-[58%]
        lg:text-[72px]

        font
        italic
        leading-none
        text-white
      "
>
  <span className="relative">
    Yes

    <span
       className="
            absolute
            left-0
            bottom-[-6px]
            h-[1px]
            w-0
            bg-white
            transition-all
            duration-500
            ease-out
            group-hover:w-full
          "
    />
  </span>
</Link>


{/* OR */}
<span
   className="
        absolute

        /* PHONE */
        left-[48%]
        top-[57%]
        text-[32px]

        /* IPAD */
        md:left-[59%]
        md:top-[58%]
        md:text-[48px]

        /* DESKTOP */
        lg:left-[68%]
        lg:top-[58%]
        lg:text-[72px]

        font
        italic
        leading-none
        text-white/45
      "
>
  or
</span>


{/* NO BUTTON */}
<Link
  href={`/private/${privateId}/exit`}
  className="
        group
        absolute

        /* PHONE */
        left-[67%]
        top-[57%]
        text-[32px]

        /* IPAD */
        md:left-[68%]
        md:top-[58%]
        md:text-[48px]

        /* DESKTOP */
        lg:left-[75%]
        lg:top-[58%]
        lg:text-[72px]

        font
        italic
        leading-none
        text-white
      "
>
  <span className="relative">
    No

    <span
      className="
            absolute
            left-0
            bottom-[-6px]
            h-[1px]
            w-0
            bg-white
            transition-all
            duration-500
            ease-out
            group-hover:w-full
          "
    />
  </span>
</Link>

  </div>

</section>
  </main>
);
}