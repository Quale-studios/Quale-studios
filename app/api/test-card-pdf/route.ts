import { NextResponse } from "next/server";
import { generateAccessCard } from "@/lib/generateAccessCard";
import { generateAccessCardPDF } from "@/lib/accessCardPdf";

export async function GET() {
  try {
    const privateId =
      "0d25392ff0161ede1860d111cb251c6cac9bcb092693bb6b3f52b36c19a39208";

    const { frontCard, backCard } =
      await generateAccessCard(privateId);

    const pdf = await generateAccessCardPDF(
      frontCard,
      backCard
    );

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'inline; filename="quale-access-card.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    return NextResponse.json(
      { error: "Unable to generate Access Card PDF." },
      { status: 500 }
    );
  }
}