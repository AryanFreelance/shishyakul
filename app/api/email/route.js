import { Resend } from "resend";
import WelcomeTemplate from "@/components/email/AbsentTemplate";
import { NextResponse } from "next/server";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { u_email, u_message } = await request.json();
  try {
    const { error } = await resend.emails.send({
      from: "Shishyakul <contact@shishyakul.in>",
      to: [...u_email],
      subject: "Thank you for contacting",
      react: WelcomeTemplate({
        u_message,
      }),
    });

    if (error) {
      return NextResponse.json({ error, status: 500 });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error, status: 500 });
  }
}
