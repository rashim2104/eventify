import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb"; // Function to connect to MongoDB
import Venues from "@/models/venue"; // Mongoose model for the Venues collection
import { authenticate } from "@/lib/authenticate"; // Authentication function
import { logger } from "@/lib/logger"; // Logging function

export async function POST(req) {
    let user;
    try {
        user = await authenticate(req);
        // Continue with your logic here
    } catch (error) {
        logger("Not Auth", "All Venues", "Unknown Session", 401);
        return NextResponse.json({ message: error.message }, { status: 401 });
    }

    // Ensure database connection
    await connectMongoDB();

    try {
        // Fetch all the venues from MongoDB
        let userVenues = await Venues.find({});
        logger(user._id, "All Venues", "Fetch successful", 200);
        return NextResponse.json({ message: userVenues }, { status: 200 });
    } catch (error) {
        console.error("Error fetching venues:", error);
        logger(user._id, "All Venues", error, 500);
        return NextResponse.json(
            { message: "An error occurred while fetching data." },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    // Ensure database connection
    await connectMongoDB();

    try {
        // Fetch all the venues from MongoDB
        let venues = await Venues.find({});
        return NextResponse.json({ venues }, { status: 200 });
    } catch (error) {
        console.error("Error fetching venues:", error);
        return NextResponse.json(
            { message: "An error occurred while fetching data." },
            { status: 500 }
        );
    }
}