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
      <h3 className="text-9xl italic font-light text-white">
        Brand Films
      </h3>
    </a>
<a
  href="https://youtube.com/"
  target="_blank"
  rel="noopener noreferrer"
  className={`watch-film relative inline-block group ml-8 mt-8 ${
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
      <h3 className="text-9xl italic font-light text-white">
        Advertisement Films
      </h3>
    </a>

    <a
      href="YOUR_AD_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className={`watch-film relative inline-block group ml-8 mt-8 ${
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
      <h3 className="text-9xl italic font-light text-white">
        Product Films
      </h3>
    </a>

    <a
      href="YOUR_PRODUCT_FILM_LINK"
      target="_blank"
      rel="noopener noreferrer"
      className={`watch-film relative inline-block group ml-8 mt-8 ${
        showProductWatch ? "watch-film-visible" : ""
      }`}
    >
      <span>Watch now</span>

      <span className="absolute left-0 -bottom-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"></span>
    </a>

  </div>
</div>
     </main>
  );
}