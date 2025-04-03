import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Update Event";
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
        const { jsonData } = await req.json();

        const updatedEvent = await Events.updateOne(
            { _id: jsonData.selectedEvent },
            {
                updateStatus: 1,
                postEventUpdateOn: new Date(),
                postEventUpdateBy: user._id,
                postEventData: jsonData,
            }
        );

        if (updatedEvent.modifiedCount > 0) {
            await logger(
                user._id,
                ACTION,
                `Event Updated Successfully - ID: ${jsonData.selectedEvent}`,
                200
            );
            return NextResponse.json(
                { message: "Event Updated" },
                { status: 200 }
            );
        } else {
            await logger(
                user._id,
                ACTION,
                `Event Not Found: ${jsonData.selectedEvent}`,
                404
            );
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 }
            );
        }
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Event Update Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred while updating the event" },
            { status: 500 }
        );
    }
}
