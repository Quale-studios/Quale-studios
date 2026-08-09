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
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.scrollTo(0, 0);
  setHideArrow(false);
}, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowArrow(true);
    }, INTRO_DURATION);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  const handleScroll = () => {
  setHideArrow(window.scrollY > 20);
};

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  const handleScroll = () => {
    if (!brandRef.current) return;

    const rect = brandRef.current.getBoundingClientRect();

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      setShowBrandWatch(
        rect.top < window.innerHeight * 0.8 &&
        rect.bottom > window.innerHeight * 0.2
      );
    } else {
      const sectionCenter = rect.top + rect.height / 2;
      const screenCenter = window.innerHeight / 2;

      setShowBrandWatch(
        Math.abs(sectionCenter - screenCenter) < 100
      );
    }
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
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
      Math.abs(sectionCenter - screenCenter) < 250
    );
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <main className="relative bg-black">

      

      <div className="flex min-h-[100svh] md:min-h-screen flex-col items-center justify-center">
        <h1 className="fade-up w-full text-center text-5xl md:text-9xl italic font-light text-white tracking-[-0.03em]">
          Quale Studios
        </h1>

        

        <p className="fade-delay mt-0 w-full text-center text-base md:text-xl italic font-bold text-white/60 tracking-[0.04em]">
          Feel the silence
        </p>

        
      </div>

{showArrow && (
 <div
  className={`fixed z-50 bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 transition-opacity duration-700 ${
    hideArrow ? "opacity-0" : "opacity-100"
  }`}
>

    <span className="scroll-arrow text-2xl md:text-3xl text-white/50">
      ↓
    </span>
  </div>
)}

<div className="h-[60vh] flex items-start">
  <div className="mx-auto w-full max-w-6xl px-12 pt-24">

    <p className="pl-2 text-4xl md:pl-7 md:text-7xl italic font-light text-white/50 tracking-[0.03em]">
      through our
    </p>

    <h2 className="-mt-2 text-5xl md:text-9xl italic font-light text-white tracking-[-0.04em] leading-none">
      Commercial films
    </h2>

  </div>

  
</div>
<div
  ref={brandRef}
   className="min-h-[80svh] md:min-h-screen flex items-center justify-center"
>

  <div className="flex flex-col items-center md:flex-row md:items-center md:gap-24">
    <a
      href="https://youtube.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <h3 className="text-5xl md:text-8xl italic font-light text-white">
        Brand Film
      </h3>
    </a>
<a
  href="https://youtube.com/"
  target="_blank"
  rel="noopener noreferrer"
  className={`watch-film relative inline-block group ml-0 mt-4 md:-ml-4 md:mt-5 ${
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
    className="min-h-[80svh] md:min-h-screen flex items-center justify-center"
>
  <div className="flex flex-col items-center md:flex-row md:items-center md:gap-24">

    <a
      href="YOUR_AD_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <h3 className="text-5xl md:text-8xl italic font-light text-white">
        Advertisement Film
      </h3>
    </a>

    <a
      href="YOUR_AD_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className={`watch-film relative inline-block group ml-0 mt-4 md:-ml-4 md:mt-5 ${
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
   className="min-h-[80svh] md:min-h-screen flex items-center justify-center"
>
  <div className="flex flex-col items-center md:flex-row md:items-center md:gap-24">

    <a
      href="YOUR_PRODUCT_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <h3 className="text-5xl md:text-8xl italic font-light text-white">
        Product Film
      </h3>
    </a>

    <a
      href="YOUR_PRODUCT_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className={`watch-film relative inline-block group ml-0 mt-4 md:-ml-4 md:mt-5 ${
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
  className="min-h-[80svh] md:min-h-screen flex items-start"
>
  <div className="mx-auto w-full max-w-6xl px-4 md:px-12 pt-16 md:pt-24">

    <p className="pl-2 md:pl-7 text-3xl md:text-6xl italic font-light text-white/50 tracking-[0.03em] leading-tight">
      These stories end in silence,<br />
      the next will be yours,
    </p>

    <h2 className="mt-6 text-5xl md:text-8xl italic font-light text-white tracking-[-0.04em] leading-none">
      Take your Access Card,
    </h2>

    <h2 className="mt-2 text-5xl md:text-8xl italic font-light text-white tracking-[-0.04em] leading-none">
      and feel the silence.
    </h2>

    <div className="mt-12 md:mt-30 flex justify-center ml-0 md:ml-22">

      <a
        href="/access-card"
        className={`group relative inline-block request-access ${
          showRequestAccess ? "request-access-visible" : ""
        }`}
      >
        <span className="text-2xl md:text-3xl italic font-light text-white">
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