import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Search Event";
    let user;

    try {
        user = await authenticate(req);
    } catch (error) {
        await logger(
            "UNKNOWN",
            ACTION,
            "Authentication Failed: " + error.message,
            401
        );
        return NextResponse.json(
            { message: "Authentication failed" },
            { status: 401 }
        );
    }

    try {
        await connectMongoDB();
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Database Connection Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "Database connection failed" },
            { status: 500 }
        );
    }

    try {
        const { eventName } = await req.json();
        const userEvents = await Events.find({
            "eventData.EventName": { $regex: eventName, $options: "i" }
        }).select({ "eventData.EventName": 1 });

        await logger(
            user._id,
            ACTION,
            `Events Found Successfully - Count: ${userEvents.length}`,
            200
        );
        return NextResponse.json(
            { events: userEvents },
            { status: 200 }
        );
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Event Search Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred while fetching data." },
            { status: 500 }
        );
    }
}
