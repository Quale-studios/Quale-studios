import { NextResponse } from "next/server";
import { generateQRCode } from "@/lib/generateQRCode";

export async function GET() {
  try {
    const { privateUrl, qrCodeDataUrl } =
      await generateQRCode("TEST-PRIVATE-ID-123");

    return NextResponse.json({
      success: true,
      privateUrl,
      qrCodeDataUrl,
    });
  } catch (error) {
    console.error("QR generation error:", error);

    return NextResponse.json(
      { error: "Unable to generate QR code." },
      { status: 500 }
    );
  }
}