import { Resend } from "resend";
import BirthdayTemplate from "@/components/email/BirthdayTemplate";
import { NextResponse } from "next/server";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    const { birthdayStudents } = await request.json();
    const currentDate = new Date();

    try {
        // Send email to admin
        const { error } = await resend.emails.send({
            from: "Shishyakul <birthday@shishyakul.in>",
            to: ["admin@shishyakul.in"],
            subject: `Birthday Notifications for ${currentDate.toLocaleDateString()}`,
            react: BirthdayTemplate({
                birthdayStudents,
                currentDate,
            }),
        });

        if (error) {
            console.error("Error sending birthday notifications:", error);
            return NextResponse.json({ error, status: 500 });
        }

        return NextResponse.json({
            status: 200,
            message: "Birthday notifications sent successfully"
        });
    } catch (error) {
        console.error("Error sending birthday notifications:", error);
        return NextResponse.json({ error, status: 500 });
    }
} 