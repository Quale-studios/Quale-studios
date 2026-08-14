import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendAccessCardEmail } from "@/lib/sendAccessCardEmail";
import { generateAccessCard } from "@/lib/generateAccessCard";
import { generateAccessCardPDF } from "@/lib/accessCardPdf";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing payment verification details." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured." },
        { status: 500 }
      );
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 }
      );
    }

    console.log("Payment verified:", razorpay_payment_id);

    // Fetch the verified Razorpay order
    const order = await razorpay.orders.fetch(razorpay_order_id);

    const name = order.notes?.name;
const businessName = order.notes?.businessName;
const email = order.notes?.email;

if (
  typeof name !== "string" ||
  typeof businessName !== "string" ||
  typeof email !== "string"
) {
      return NextResponse.json(
        { error: "Customer details not found on Razorpay order." },
        { status: 400 }
      );
    }

    // Generate unique Private ID
    const privateId = crypto.randomBytes(32).toString("hex");

    console.log("Private ID generated:", privateId);
    const { frontCard, backCard } =
  await generateAccessCard(privateId);

console.log("Access Card generated for Private ID:", privateId);

const accessCardPDF = await generateAccessCardPDF(
  frontCard,
  backCard
);

console.log("Access Card PDF generated:", privateId);
    // Save Access Card
    const { data: accessCard, error: databaseError } =
      await supabaseAdmin
        .from("access_cards")
        .insert({
          private_id: privateId,
          name,
          business_name: businessName,
          email,
          razorpay_order_id,
          razorpay_payment_id,
          currency: order.currency,
          amount: order.amount,
          payment_status: "paid",
        })
        .select()
        .single();

    if (databaseError) {
      console.error("Database error:", databaseError);

      return NextResponse.json(
        { error: "Unable to save access card." },
        { status: 500 }
      );
    }

    console.log("Access Card saved:", accessCard);
    
try {
  await sendAccessCardEmail(
    email,
    accessCardPDF
  );
} catch (emailError) {
  console.error("Access Card email failed:", emailError);
}
    return NextResponse.json({
      success: true,
      message: "Payment verified and Access Card saved.",
      privateId,
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 }
    );
  }
}