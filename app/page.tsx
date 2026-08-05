"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {

   const INTRO_DURATION = 3500;

  const [showArrow, setShowArrow] = useState(false);
  const [hideArrow, setHideArrow] = useState(false);

  const brandRef = useRef<HTMLDivElement>(null);
const [showBrandWatch, setShowBrandWatch] = useState(false);

const productRef = useRef<HTMLDivElement>(null);
const adRef = useRef<HTMLDivElement>(null);

const [showProductWatch, setShowProductWatch] = useState(false);
const [showAdWatch, setShowAdWatch] = useState(false);

const endingRef = useRef<HTMLDivElement>(null);
const [showRequestAccess, setShowRequestAccess] = useState(false);

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

useEffect(() => {
  const handleScroll = () => {
    if (!brandRef.current) return;

    const rect = brandRef.current.getBoundingClientRect();

    const sectionCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;

    setShowBrandWatch(
      Math.abs(sectionCenter - screenCenter) < 100
    );
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  const handleScroll = () => {
    if (!productRef.current) return;

    const rect = productRef.current.getBoundingClientRect();

    const sectionCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;

    setShowProductWatch(
      Math.abs(sectionCenter - screenCenter) < 100
    );
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  const handleScroll = () => {
    if (!adRef.current) return;

    const rect = adRef.current.getBoundingClientRect();

    const sectionCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;

    setShowAdWatch(
      Math.abs(sectionCenter - screenCenter) < 100
    );
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  const handleScroll = () => {
    if (!endingRef.current) return;

    const rect = endingRef.current.getBoundingClientRect();

    const sectionCenter = rect.top + rect.height / 2;
    const screenCenter = window.innerHeight / 2;

    setShowRequestAccess(
      Math.abs(sectionCenter - screenCenter) < 70
    );
  };

  handleScroll();

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
<div
  ref={brandRef}
  className="min-h-screen flex items-center justify-center"
>

  <div className="flex items-center gap-24">

    <a
      href="https://youtube.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <h3 className="text-8xl italic font-light text-white">
        Brand Film
      </h3>
    </a>
<a
  href="https://youtube.com/"
  target="_blank"
  rel="noopener noreferrer"
  className={`watch-film relative inline-block group -ml-4 mt-5 ${
    showBrandWatch ? "watch-film-visible" : ""
  }`}
>
    
     <span>Watch now</span>

  <span className="absolute left-0 -bottom-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
</a>
  </div>



</div>
<div
  ref={adRef}
  className="min-h-screen flex items-center justify-center"
>
  <div className="flex items-center gap-24">

    <a
      href="YOUR_AD_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <h3 className="text-8xl italic font-light text-white">
        Advertisement Film
      </h3>
    </a>

    <a
      href="YOUR_AD_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className={`watch-film relative inline-block group -ml-4 mt-5 ${
        showAdWatch ? "watch-film-visible" : ""
      }`}
    >
      <span>Watch now</span>

      <span className="absolute left-0 -bottom-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
    </a>

  </div>
</div>

<div
  ref={productRef}
  className="min-h-screen flex items-center justify-center"
>
  <div className="flex items-center gap-24">

    <a
      href="YOUR_PRODUCT_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <h3 className="text-8xl italic font-light text-white">
        Product Film
      </h3>
    </a>

    <a
      href="YOUR_PRODUCT_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className={`watch-film relative inline-block group -ml-4 mt-5 ${
        showProductWatch ? "watch-film-visible" : ""
      }`}
    >
      <span>Watch now</span>

      <span className="absolute left-0 -bottom-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
    </a>

  </div>
</div>
<div
  ref={endingRef}
  className="min-h-screen flex items-start"
>
  <div className="mx-auto w-full max-w-6xl px-12 pt-24">

    <p className="pl-7 text-6xl italic font-light text-white/50 tracking-[0.03em] leading-tight">
      These stories end in silence,<br />
      the next will be yours,
    </p>

    <h2 className="mt-6 text-8xl italic font-light text-white tracking-[-0.04em] leading-none">
      Take your Access Card,
    </h2>

    <h2 className="mt-2 text-8xl italic font-light text-white tracking-[-0.04em] leading-none">
      and feel the silence.
    </h2>

    
    <div className="mt-30 flex justify-center ml-22">
  <a
  href="/access-card"
  className={`group relative inline-block request-access ${
    showRequestAccess ? "request-access-visible" : ""
  }`}
>
  <span className="text-3xl italic font-light text-white">
    Request Access card
  </span>


        <span className="absolute left-0 -bottom-2 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
      </a>
    </div>

  </div>
</div>

     </main>
  );
}