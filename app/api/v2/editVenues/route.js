import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Venues from "@/models/venue";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Edit Venues";
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
        const { venues } = await req.json();

        const bulkOperations = venues.map(venue => ({
            updateOne: {
                filter: { venueId: venue.venueId },
                update: { $set: venue },
            }
        }));

        await Venues.bulkWrite(bulkOperations);

        await logger(
            user._id,
            ACTION,
            `Venues Updated Successfully: ${venues.length} venues`,
            200
        );
        return NextResponse.json(
            { message: "Venues updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Venues Update Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred while updating data." },
            { status: 500 }
        );
    }
}