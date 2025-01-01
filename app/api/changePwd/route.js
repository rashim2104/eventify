import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Change Password";
    let authenticatedUser;

    try {
        authenticatedUser = await authenticate(req);
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

    const { email, isSuperAdmin } = authenticatedUser;

    try {
        await connectMongoDB();
    } catch (error) {
        await logger(
            email,
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

        if (valueToJson.action === 'user') {
            const { oldPassword, newPassword } = valueToJson;
            const user = await User.findOne({ email });

            if (!user) {
                await logger(
                    email,
                    ACTION,
                    "User Not Found",
                    404
                );
                return NextResponse.json(
                    { message: "User doesn't exist" },
                    { status: 404 }
                );
            }

            const passwordsMatch = await bcrypt.compare(oldPassword, user.password);
            if (!passwordsMatch) {
                await logger(
                    user._id,
                    ACTION,
                    "Wrong Password",
                    401
                );
                return NextResponse.json(
                    { message: "Wrong password" },
                    { status: 401 }
                );
            }

            // Add this new validation
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                await logger(
                    user._id,
                    ACTION,
                    "New Password Same as Old Password",
                    400
                );
                return NextResponse.json(
                    { message: "New password cannot be the same as old password" },
                    { status: 400 }
                );
            }

            const salt = await bcrypt.genSalt(10);
            const newPasswordHashed = await bcrypt.hash(newPassword, salt);
            await User.updateOne({ email }, { password: newPasswordHashed });

            await logger(
                user._id,
                ACTION,
                "Password Changed Successfully",
                201
            );

            // Send updated session info
            return NextResponse.json(
                { 
                    message: "Password Changed",
                    hasDefaultPassword: false,
                    user: {
                        ...user.toObject(),
                        password: newPasswordHashed
                    }
                },
                { status: 201 }
            );
        }

        if (valueToJson.action === 'admin') {
            if (!isSuperAdmin) {
                await logger(
                    email,
                    ACTION,
                    "Unauthorized Access: Not Super Admin",
                    403
                );
                return NextResponse.json(
                    { message: "You are not authorized to perform this action." },
                    { status: 403 }
                );
            }

            const existingUser = await User.findById(valueToJson._id);
            if (!existingUser) {
                await logger(
                    email,
                    ACTION,
                    "User Not Found",
                    404
                );
                return NextResponse.json(
                    { message: "User not found." },
                    { status: 404 }
                );
            }

            existingUser.password = "$2a$10$2IW2QdaUVRs.8VpgriyqZ.oY34Skm0Sli6E95s09Ax3gqe5gWr2VK";
            await existingUser.save();

            await logger(
                email,
                ACTION,
                "Password Reset to Default",
                200
            );
            return NextResponse.json(
                { message: "Password updated to Welcome@123" },
                { status: 200 }
            );
        }

    } catch (error) {
        await logger(
            email,
            ACTION,
            "Password Change Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred while changing password." },
            { status: 500 }
        );
    }
}
