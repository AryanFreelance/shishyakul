import { Resend } from "resend";
import ContactTemplate from "@/components/email/ContactTemplate";
import { NextResponse } from "next/server";
import RequestReview from "@/components/email/RequestReview";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { name, email, ay, grade, userId, feeData, additionalMessage } =
    await request.json();
  try {
    // TODO: Remove personal email from here
    const { error } = await resend.emails.send({
      from: "Shishyakul <review@shishyakul.in>",
      to: ["shishyakul@gmail.com", "shindearyan179@gmail.com"],
      subject: "New Review Requested",
      react: RequestReview({
        name,
        email,
        ay,
        grade,
        userId,
        additionalMessage,
        feeData,
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
