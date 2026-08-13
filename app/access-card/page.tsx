"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AccessCardPage() {

useEffect(() => {
  const section = document.querySelector(".fade-section");

  if (!section) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add("active");
        observer.disconnect();
      }
    },
    {
      root: null,
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    }
  );

  observer.observe(section);

  return () => {
    observer.disconnect();
  };
}, []);

  return (
    <main className="min-h-screen bg-black text-white">

      <section className="relative min-h-screen px-6 md:px-40">

        {/* Line 1 */}
        <div className="absolute left-14 top-[36%] font italic text-3xl text-white md:left-59 md:top-[31%] md:text-7xl">
            By watching our films,
        </div>

        {/* Line 2 */}
        <div className="absolute left-13 top-[42%] font italic text-3xl text-white/45 md:left-57 md:top-[41%] md:text-7xl">
          some feel the silence,
        </div>

        {/* Line 3 */}
        <div className="absolute left-13 top-[48%] font italic text-3xl text-white md:left-57 md:top-[51%] md:text-7xl">
          but the person who is here,
        </div>

        {/* Line 4 */}
        <div className="absolute left-12 top-[54%] font italic text-3xl text-white/45 md:left-56 md:top-[61%] md:text-7xl">
          will enter into the,
        </div>

        {/* Line 5 */}
        <div className="absolute left-12 top-[60%] font italic text-3xl text-white md:left-56 md:top-[71%] md:text-7xl">
          World of Silence.
        </div>

      </section>
{/* Second Section */}
<section className="relative min-h-screen">

  {/* Line 1 */}
  <div className="absolute left-[50%] top-[34%] -translate-x-1/2 whitespace-nowrap font italic text-3xl text-white/45 md:top-[34%] md:text-7xl">
    But to enter a world,
  </div>

  {/* Line 2 */}
  <div className="absolute left-[50%] top-[40%] -translate-x-1/2 whitespace-nowrap font italic text-4xl text-white md:top-[43%] md:text-8xl">
    you will need a key,
  </div>

</section>


<section className="relative min-h-screen">

  {/* Line 3 */}
  <div className="absolute left-[50%] top-[39%] -translate-x-1/2 whitespace-nowrap font italic text-3xl text-white/45 md:top-[39%] md:text-7xl">
    And before you take it,
  </div>

  {/* Line 4 */}
  <div className="absolute left-[50%] top-[45%] -translate-x-1/2 whitespace-nowrap font italic text-4xl text-white md:top-[48%] md:text-8xl">
    let’s see what it unlocks...
  </div>

</section>

{/* Third Section */}
<section className="relative min-h-screen fade-section">

  {/* Line 1 */}
  <div className="absolute left-[8%] top-[25%] font italic text-2xl text-white fade-line line-1 md:left-[13%] md:top-[28%] md:text-7xl">
    . Story concepts ( Two )
  </div>

  {/* Line 2 */}
  <div className="absolute left-[8%] top-[31%] font italic text-2xl text-white  fade-line line-2 md:left-[13%] md:top-[37%] md:text-7xl">
    . Story explanations
  </div>

  {/* Line 3 */}
  <div className="absolute left-[8%] top-[37%] font italic text-2xl text-white fade-line line-3 md:left-[13%] md:top-[46%] md:text-7xl">
    . Rough script based on story ( Two )
  </div>

  {/* Line 4 */}
  <div className="absolute left-[8%] top-[49%] font italic text-x1 text-white/45 fade-line line-4 md:left-[13%] md:top-[63%] md:text-7xl">
    Within seven days, with progress ( tracking ) details
  </div>


</section>

{/* Final Section */}
<section className="relative min-h-screen">

  {/* Set 1 */}
  <div className="absolute left-[7%] top-[18%] font italic text-2xl text-white md:left-[13%] md:top-[18%] md:text-5xl">
    <div>
      We can give you all of these based on your Q&A
    </div>
    <div>
      and don’t worry, this access card works only as a key,
    </div>
  </div>

  {/* Set 2 */}
  <div className="absolute left-[7%] top-[34%] font italic text-2xl text-white md:left-[13%] md:top-[32%] md:text-5xl">
    <div>
      You will get proper (Pre-production, Production &
    </div>
    <div>
      Post-production) for your films,
    </div>
  </div>

  {/* Set 3 */}
  <div className="absolute left-[7%] top-[46%] font italic text-2xl text-white md:left-[13%] md:top-[46%] md:text-5xl">
    <div>
      with Q&As to explain your business & fixed prices, only once you
    </div>
    <div>
      enter your own world through...
    </div>
  </div>

{/* Access Card Button */}
<Link
  href="/access-card/details"
  className="group absolute left-[50%] top-[66%] -translate-x-1/2 font italic text-3xl text-white md:left-[57%] md:top-[62%] md:translate-x-0 md:text-5xl"
>
  <span className="relative">
    Access Card

    <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-white transition-all duration-500 ease-out group-hover:w-full"></span>
  </span>
</Link>

</section>

</main>
  );
}