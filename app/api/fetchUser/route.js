// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Fetch User";
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

    if (!user.isSuperAdmin) {
        await logger(
            user._id,
            ACTION,
            "Authorization Failed: Not Super Admin",
            403
        );
        return NextResponse.json(
            { message: "You are not authorized to perform this action." },
            { status: 403 }
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
        const { action, mail } = await req.json();

        if (action === "fetchUser") {
            const userDetails = await User.find({ email: mail }, { password: 0 });
            
            if (userDetails.length === 0) {
                await logger(
                    user._id,
                    ACTION,
                    `User Not Found: ${mail}`,
                    404
                );
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                );
            }

            await logger(
                user._id,
                ACTION,
                `User Details Fetched Successfully - Email: ${mail}`,
                200
            );
            return NextResponse.json(
                { message: userDetails },
                { status: 200 }
            );
        }
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "User Fetch Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred while fetching user details" },
            { status: 500 }
        );
    }
}
