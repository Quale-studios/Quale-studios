"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";

  const isActive = (page: string) => {
    if (isHome) return true;
    return pathname === `/${page}`;
  };
  return (
    <nav className="fade-navbar fixed top-0 left-1 z-50 w-full flex items-center justify-between px-5 py-5">

      <Link href="/">
        <Image
          src="/Logo.png"
          alt="Quale Studios"
          width={145}
          height={40}
          priority
        />
      </Link>

      <div className="flex items-center gap-10">
        <Link
  href="/films"
  className={`group relative text-xl italic font-medium tracking-[0.08em] transition-all duration-300 ${
    isActive("films")
      ? "text-white"
      : "text-white/40 hover:text-white"
  }`}
>
  Films

  {isActive("films") && !isHome && (
  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white" />
)}

  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 ease-out" />
</Link>

        <Link
  href="/about"
  className={`group relative text-xl italic font-medium tracking-[0.08em] transition-all duration-300 ${
    isActive("about")
      ? "text-white"
      : "text-white/40 hover:text-white"
  }`}
>
  About
{isActive("about") && !isHome && (
  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white" />
)}
  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 ease-out" />
</Link>

       <Link
  href="/contact"
  className={`group relative text-xl italic font-medium tracking-[0.08em] transition-all duration-300 ${
    isActive("contact")
      ? "text-white"
      : "text-white/40 hover:text-white"
  }`}
>
  Contact

  {isActive("contact") && !isHome && (
  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white" />
)}

  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 ease-out" />
</Link>


        <Link
  href="/access-card"
  className={`group relative text-xl italic font-medium tracking-[0.08em] transition-all duration-300 ${
   isActive("access-card")
      ? "text-white"
      : "text-white/40 hover:text-white"
  }`}
>
  Access Card

  {isActive("access-card") && !isHome && (
  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white" />
)}

  <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-px w-[90%] bg-white scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 ease-out" />
</Link>

      </div>

    </nav>
  );
}