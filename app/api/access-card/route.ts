import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, businessName, email } = body;

const country = request.headers.get("x-vercel-ip-country") || "IN";

const currency = country === "IN" ? "INR" : "USD";
console.log("Detected country:", country);
console.log("Selected currency:", currency);

    if (!name || !businessName || !email || !currency) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    let amount: number;

    if (currency === "INR") {
      amount = 2500 * 100;
    } else if (currency === "USD") {
      amount = 30 * 100;
    } else {
      return NextResponse.json(
        { error: "Unsupported currency." },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `access_card_${Date.now()}`,
      notes: {
  name,
  businessName,
  email,
},
    });

    console.log("Razorpay Order Created:", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error("Razorpay order error:", error);

    return NextResponse.json(
      { error: "Unable to create payment order." },
      { status: 500 }
    );
  }
}