import { Resend } from "resend";
import ContactTemplate from "@/components/email/ContactTemplate";
import { NextResponse } from "next/server";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { u_name, u_email, u_phone, u_message } = await request.json();
  try {
    const { error } = await resend.emails.send({
      from: "Shishyakul <contact@shishyakul.in>",
      to: ["shishyakul@gmail.com"],
      subject: "Website Contact Enquiry",
      react: ContactTemplate({
        u_name,
        u_email,
        u_phone,
        u_message,
        u_user: "admin",
      }),
    });

    const { error: uerror } = await resend.emails.send({
      from: "Shishyakul <contact@shishyakul.in>",
      to: [u_email],
      subject: "Thank you for contacting!",
      react: ContactTemplate({
        u_name,
        u_email,
        u_phone,
        u_message,
        u_user: "user",
      }),
    });

    if (error || uerror) {
      return NextResponse.json({ error, status: 500 });
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error, status: 500 });
  }
}
