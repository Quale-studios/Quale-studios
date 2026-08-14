import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAccessCardEmail(
  email: string,
  accessCardPDF: Buffer
) {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Your Quale Studios Access Card",

    html: `
      <div style="font-family: Arial, sans-serif;">
        <p>Here is your card.</p>
      </div>
    `,

   attachments: [
  {
    filename: "Quale-Studios-Access-Card.pdf",
    content: accessCardPDF.toString("base64"),
  },
],
  });

  if (error) {
    console.error("Email error:", error);
    throw new Error("Unable to send Access Card email.");
  }

  console.log("Access Card email sent:", data?.id);

  return data;
}