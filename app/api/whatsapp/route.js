import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { phone } = await request.json();

    const response = await fetch(
      "https://graph.facebook.com/v21.0/592543543932338/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: "absent_student",
            language: { code: "en" },
          },
        }),
      }
    );

    const data = await response.json();
    console.log("RESPONSE", response);
    console.log("RESPONSE", data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
