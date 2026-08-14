import { NextResponse } from "next/server";
import { generateAccessCard } from "@/lib/generateAccessCard";

export async function GET() {
  try {
    const privateId =
      "0d25392ff0161ede1860d111cb251c6cac9bcb092693bb6b3f52b36c19a39208";

    const { frontCard, backCard } =
      await generateAccessCard(privateId);

    return new NextResponse(
      `
        <html>
          <body style="background:#222; margin:0; padding:40px;">
            <h2 style="color:white;">Front</h2>
            <img
              src="data:image/png;base64,${frontCard.toString("base64")}"
              style="max-width:100%;"
            />

            <h2 style="color:white; margin-top:40px;">Back</h2>
            <img
              src="data:image/png;base64,${backCard.toString("base64")}"
              style="max-width:100%;"
            />
          </body>
        </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Access Card generation error:", error);

    return NextResponse.json(
      { error: "Unable to generate Access Card." },
      { status: 500 }
    );
  }
}