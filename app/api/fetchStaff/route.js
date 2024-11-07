import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req) {
    await connectMongoDB();

    try {
        // Log the raw request body
        const rawBody = await req.text();
        console.log("Raw Body:", rawBody);

        // Parse the JSON body
        const valueToJson = JSON.parse(rawBody);

        // Extract data from the parsed JSON
        let { staffId } = valueToJson;

        if (!staffId) {
            return NextResponse.json({ message: "Missing staffId in request body" }, { status: 400 });
        }

        // Fetch staff from MongoDB using staffId
        console.log("Fetching staff with ID:", staffId);
        let staff = await User.findOne({ id: staffId });
        if (staff === null) {
            return NextResponse.json({ message: "Staff not found" }, { status: 404 });
        }

        // Filter only the necessary details from staff
        const filteredStaffDetails = {
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            role: staff.role
        };

        // Return response with only the filtered details
        return NextResponse.json({ message: "Staff fetched successfully", staff: filteredStaffDetails }, { status: 200 });
    } catch (error) {
        console.error("Error:", error.message);
        // Handle any errors (e.g., JSON parsing)
        return NextResponse.json({ message: "Invalid JSON input" }, { status: 400 });
    }
}
