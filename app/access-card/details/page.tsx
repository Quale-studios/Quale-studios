"use client";

import { useState } from "react";
import Script from "next/script";

export default function AccessCardDetailsPage() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentComplete, setPaymentComplete] = useState(false);

 const handleContinue = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("/api/access-card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        businessName,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data.error);
      return;
    }

    const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: data.amount,
  currency: data.currency,
  name: "Quale Studios",
  description: "Access Card",
  order_id: data.orderId,

  prefill: {
    name: name,
    email: email,
  },

  theme: {
    color: "#000000",
  },

  handler: async function (response: any) {
    try {
      const verifyResponse = await fetch("/api/access-card/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });
const verifyData = await verifyResponse.json();

console.log("Verification response:", verifyData);

if (verifyData.success) {
  setPaymentComplete(true);
}

    } catch (error) {
      console.error("Verification request failed:", error);
    }
  },
};

const razorpay = new (window as any).Razorpay(options);

razorpay.open();

  } catch (error) {
    console.error("Payment request failed:", error);
  }
};
  return (
    <main className="min-h-screen bg-black text-white">
      <Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="afterInteractive"
/>
{paymentComplete ? (
  <div className="flex min-h-screen items-center justify-center">
    <h1 className="font italic text-5xl text-white">
      Check your mail.
    </h1>
  </div>
) : (
      <form
        onSubmit={handleContinue}
        className="relative min-h-screen"
      >

        {/* Your Name */}
        <div className="absolute left-[50%] top-[25%] -translate-x-1/2 text-center md:top-[34%]">
          <h1 className="font italic text-2xl md:text-5xl">
            Your Name?
          </h1>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-3 h-7 w-[220px] rounded-full border border-white bg-transparent px-5 text-center text-white outline-none md:h-8 md:w-[280px]"
          />
        </div>

        {/* Business Name */}
        <div className="absolute left-[50%] top-[40%] -translate-x-1/2 text-center md:top-[48%]">
          <h1 className="font italic text-2xl md:text-5xl">
            Your Business Name?
          </h1>

          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className="mt-3 h-7 w-[220px] rounded-full border border-white bg-transparent px-5 text-center text-white outline-none md:h-8 md:w-[280px]"
          />
        </div>

        {/* E-mail */}
        <div className="absolute left-[50%] top-[55%] -translate-x-1/2 text-center md:top-[62%]">
          <h1 className="font italic text-2xl md:text-5xl">
            Your E-mail ID?
          </h1>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-3 h-7 w-[220px] rounded-full border border-white bg-transparent px-5 text-center text-white outline-none md:h-8 md:w-[280px]"
          />
        </div>

        {/* Continue */}
        <button
          type="submit"
          className="group absolute left-[50%] top-[70%] -translate-x-1/2 font italic text-3xl text-white md:left-[80%] md:top-[86%] md:text-4xl"
        >
          <span className="relative inline-block">
            Continue

            <span className="pointer-events-none absolute left-0 -bottom-1 h-[1px] w-full origin-left scale-x-0 bg-white transition-transform duration-500 ease-out will-change-transform group-hover:scale-x-100"></span>
          </span>
        </button>

      </form>
)}
    </main>
  );
}