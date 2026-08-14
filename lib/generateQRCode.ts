import QRCode from "qrcode";

export async function generateQRCode(privateId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const privateUrl = `${baseUrl}/private/${privateId}`;

  const qrCodeDataUrl = await QRCode.toDataURL(privateUrl, {
    width: 600,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  return {
    privateUrl,
    qrCodeDataUrl,
  };
}