import QRCode from "qrcode";

export async function generateQRCode(
  privateId: string,
  qrSecret: string
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const activationUrl =
    `${baseUrl}/private/activate` +
    `?privateId=${encodeURIComponent(privateId)}` +
    `&token=${encodeURIComponent(qrSecret)}`;

  const qrCodeDataUrl = await QRCode.toDataURL(activationUrl, {
    width: 600,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  return {
    activationUrl,
    qrCodeDataUrl,
  };
}