import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { NextResponse } from "next/server";
import { GET_TODAYS_BIRTHDAYS } from "@/graphql/queries/birthdays.query";
import { UPDATE_BIRTHDAY_NOTIFICATION } from "@/graphql/mutations/birthdays.mutation";
import fetch from "node-fetch";

// Allow this API route to be invoked by Vercel cron
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Set to true to bypass all API route protection for testing
export const runtime = "nodejs";

// Create a new Apollo Client instance for serverless environment
const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://api.shishyakul.in/",
    fetch: fetch,
});

const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            "x-api-key": process.env.GRAPHQL_API_KEY || "",
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export async function GET(request) {
    try {
        // Log request info for debugging
        console.log("Cron job triggered", new Date().toISOString());

        // Fetch today's birthdays
        const { data } = await client.query({
            query: GET_TODAYS_BIRTHDAYS,
            fetchPolicy: "network-only",
        });

        const todaysBirthdays = data?.todaysBirthdays?.today || [];

        if (todaysBirthdays.length === 0) {
            console.log("No birthdays today");
            return NextResponse.json({
                status: 200,
                message: "No birthdays today",
            });
        }

        console.log(`Found ${todaysBirthdays.length} birthdays today`);
        console.log("TODAYS BIRTHDAYS", todaysBirthdays)

        // Send email notification with the list of birthday students
        const emailResponse = await fetch(`${"http://localhost:3000"}/api/birthday`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                birthdayStudents: todaysBirthdays,
            }),
        });
        console.log("EMAIL RESPONSE STATUS:", emailResponse.status);

        if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error("Error sending birthday emails:", errorText);
            return NextResponse.json({
                status: 500,
                message: "Failed to send birthday notifications",
                error: errorText
            });
        }

        // Try to get response JSON
        let emailResult;
        try {
            emailResult = await emailResponse.json();
            console.log("Email sending result:", emailResult);
        } catch (e) {
            console.log("Could not parse email response as JSON:", e.message);
        }

        // Update notification status for each student
        for (const student of todaysBirthdays) {
            await client.mutate({
                mutation: UPDATE_BIRTHDAY_NOTIFICATION,
                variables: {
                    userId: student.userId,
                    notificationSent: true,
                },
            });
        }

        console.log("Updated notification status for all students");

        return NextResponse.json({
            status: 200,
            message: `Sent birthday notifications for ${todaysBirthdays.length} students`,
            students: todaysBirthdays.map(s => `${s.firstname} ${s.lastname}`),
        });
    } catch (error) {
        console.error("Error processing birthday notifications:", error);

        return NextResponse.json({
            status: 500,
            message: "Error processing birthday notifications",
            error: error.message,
        });
    }
} 