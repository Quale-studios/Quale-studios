"use client";

import { useEffect, useState } from "react";

export default function Home() {

   const INTRO_DURATION = 3500;

  const [showArrow, setShowArrow] = useState(false);
  const [hideArrow, setHideArrow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(true);
    }, INTRO_DURATION);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 20) {
      setHideArrow(true);
    }
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  
  return (
    <main className="relative bg-black">

      

      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="fade-up text-9xl italic font-light text-white tracking-[-0.03em]">
          Quale Studios
        </h1>

        

        <p className="fade-delay mt-0 text-xl italic font-bold text-white/60 tracking-[0.04em]">
          Feel the silence
        </p>

        
      </div>

{showArrow && (
  <div
  className={`fixed bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-700 ${
    hideArrow ? "opacity-0" : "opacity-100"
  }`}
>
    <span className="scroll-arrow text-3xl text-white/50">
      ↓
    </span>
  </div>
)}

<div className="h-[60vh] flex items-start">
  <div className="mx-auto w-full max-w-6xl px-12 pt-24">

    <p className="pl-7 text-7xl italic font-light text-white/50 tracking-[0.03em]">
      through our
    </p>

    <h2 className="-mt-2 text-9xl italic font-light text-white tracking-[-0.04em] leading-none">
      Commercial films
    </h2>

  </div>

  
</div>
<div className="min-h-screen flex items-center justify-center pt-8">

  <a
    href="https://youtu.be/17ZR1mx5LGU?si=-kN94_I3wMEPKmrR"
    target="_blank"
    rel="noopener noreferrer"
    className="group"
  >
    <h3 className="group relative text-center text-9xl italic font-light text-white">
  Brand Film

  <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-px w-[90%] bg-white scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100" />
</h3>
  </a>


</div>
<div className="min-h-screen flex items-center justify-center pt-8">

  <a
    href="https://youtu.be/17ZR1mx5LGU?si=-kN94_I3wMEPKmrR"
    target="_blank"
    rel="noopener noreferrer"
    className="group"
  >
    <h3 className="group relative text-center text-9xl italic font-light text-white">
  Advertisement Film

  <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-px w-[90%] bg-white scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100" />
</h3>
  </a>


</div>
<div className="min-h-screen flex items-center justify-center pt-8">

  <a
    href="https://youtu.be/17ZR1mx5LGU?si=-kN94_I3wMEPKmrR"
    target="_blank"
    rel="noopener noreferrer"
    className="group"
  >
    <h3 className="group relative text-center text-9xl italic font-light text-white">
  Product Film

  <span className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-px w-[90%] bg-white scale-x-0 origin-center transition-transform duration-300 ease-out group-hover:scale-x-100" />
</h3>
  </a>


</div>
    </main>
  );
}