import { PDFDocument } from "pdf-lib";

export async function generateAccessCardPDF(
  frontCard: Buffer,
  backCard: Buffer
) {
  const pdfDoc = await PDFDocument.create();

  // Front
  const frontPage = pdfDoc.addPage([4026, 2599]);

  const frontImage = await pdfDoc.embedPng(frontCard);

  frontPage.drawImage(frontImage, {
    x: 0,
    y: 0,
    width: 4026,
    height: 2599,
  });

  // Back
  const backPage = pdfDoc.addPage([4026, 2599]);

  const backImage = await pdfDoc.embedPng(backCard);

  backPage.drawImage(backImage, {
    x: 0,
    y: 0,
    width: 4026,
    height: 2599,
  });

  return Buffer.from(await pdfDoc.save());
}