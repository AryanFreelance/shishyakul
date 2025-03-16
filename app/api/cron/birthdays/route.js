import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { NextResponse } from "next/server";
import { GET_TODAYS_BIRTHDAYS } from "@/graphql/queries/birthdays.query";
import { UPDATE_BIRTHDAY_NOTIFICATION } from "@/graphql/mutations/birthdays.mutation";
import fetch from "node-fetch";

// Allow this API route to be invoked by Vercel cron
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
        // Check for authentication
        const apiSecret = process.env.CRON_API_SECRET || "shishyakul-cron-secret";

        // Get authorization from header or query parameter
        const authHeader = request.headers.get("authorization");
        const url = new URL(request.url);
        const authParam = url.searchParams.get("auth");

        // Check if either the header or query param matches the secret
        const isAuthorized =
            (authHeader && authHeader === `Bearer ${apiSecret}`) ||
            (authParam && authParam === apiSecret);

        // For Vercel's own cron system, no auth is required
        const isVercelCron = request.headers.get("x-vercel-cron") === "1";

        if (!isAuthorized && !isVercelCron) {
            console.log("Unauthorized access attempt to cron API");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch today's birthdays
        const { data } = await client.query({
            query: GET_TODAYS_BIRTHDAYS,
            fetchPolicy: "network-only",
        });

        const todaysBirthdays = data?.todaysBirthdays?.today || [];

        if (todaysBirthdays.length === 0) {
            return NextResponse.json({
                status: 200,
                message: "No birthdays today",
            });
        }
        console.log("TODAYS BIRTHDAYS", todaysBirthdays)

        // Send email notification with the list of birthday students
        const emailResponse = await fetch(`${"https://shishyakul.in"}/api/birthday`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                birthdayStudents: todaysBirthdays,
            }),
        });

        if (!emailResponse.ok) {
            console.error("Error sending birthday emails:", await emailResponse.text());
            return NextResponse.json({
                status: 500,
                message: "Failed to send birthday notifications",
            });
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
        console.log("ADDEd NOTIFICATION")

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