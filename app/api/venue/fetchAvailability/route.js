import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import Reservation from "@/models/reservation";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Fetch Venue Availability";
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
        const valueToJson = await req.json();
        const dates = valueToJson.selectedSessions.map(item => item.date);

        const venueList = await Venue.find({ isAvailable: true });
        const prevReservations = await Reservation.find({
            reservationDate: { $in: dates }
        });

        await logger(
            user._id,
            ACTION,
            `Venues and Reservations Fetched Successfully - Venues: ${venueList.length}, Reservations: ${prevReservations.length}`,
            200
        );
        return NextResponse.json(
            { message: { venueList, prevReservations } },
            { status: 200 }
        );
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Data Fetch Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred while fetching data." },
            { status: 500 }
        );
    }
}
