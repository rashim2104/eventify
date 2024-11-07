import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb"; // Function to connect to MongoDB
import Venues from "@/models/venue"; // Mongoose model for the Venues collection
import { authenticate } from "@/lib/authenticate"; // Authentication function
import { logger } from "@/lib/logger"; // Logging function

export async function POST(req) {
    let user = { _id: "6134b2d9f1c8d8e1e0d8f4a3" };
    // try {
    //     user = await authenticate(req);
    //     if (user.role !== "admin") {
    //         throw new Error("Not authorized");
    //     }
    // } catch (error) {
    //     logger("Not Auth", "Edit Venues", "Unknown Session", 401);
    //     return NextResponse.json({ message: error.message }, { status: 401 });
    // }

    // Ensure database connection
    await connectMongoDB();

    try {
        const { venues } = await req.json();

        const bulkOperations = venues.map(venue => ({
            updateOne: {
                filter: { venueId: venue.venueId },
                update: { $set: venue },
            }
        }));

        await Venues.bulkWrite(bulkOperations);

        logger(user._id, "Edit Venues", "Update successful", 200);
        return NextResponse.json({ message: "Venues updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating venues:", error);
        logger(user._id, "Edit Venues", error, 500);
        return NextResponse.json(
            { message: "An error occurred while updating data." },
            { status: 500 }
        );
    }
}