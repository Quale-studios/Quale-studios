import sharp from "sharp";
import { generateQRCode } from "@/lib/generateQRCode";

export async function generateAccessCard(privateId: string) {
  const { qrCodeDataUrl } = await generateQRCode(privateId);

  const qrBuffer = Buffer.from(
    qrCodeDataUrl.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );

  const qrSize = 1100;

  const qr = await sharp(qrBuffer)
    .resize(qrSize, qrSize)
    .png()
    .toBuffer();

  const backCard = await sharp("public/access-card/back.png")
    .composite([
      {
        input: qr,
        left: 300,
        top: 820,
      },
    ])
    .png()
    .toBuffer();

  const frontCard = await sharp("public/access-card/front.png")
    .png()
    .toBuffer();

  return {
    frontCard,
    backCard,
  };
}