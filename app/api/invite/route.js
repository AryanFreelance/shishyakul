import { Resend } from "resend";
import NewStudentTemplate from "@/components/email/NewStudent";
import { NextResponse } from "next/server";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { email, r_message, r_code } = await request.json();
  try {
    const { error } = await resend.emails.send({
      from: "Shishyakul <invite@shishyakul.in>",
      to: [email],
      subject: "You are invited to Shishyakul!",
      react: NewStudentTemplate({
        r_message,
        r_code,
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
