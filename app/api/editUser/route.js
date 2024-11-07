import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { authenticate } from '@/lib/authenticate';
import { logger } from "@/lib/logger";

// API route for updating a user
export async function POST(req) {
  const user = await authenticate(req);
  if (!user.isSuperAdmin) {
    logger(user._id, "Update User", "Not Authorized", 401);
    return NextResponse.json(
      { message: "You are not authorized to update a user." },
      { status: 401 }
    );
  }

  await connectMongoDB();

  const valueToJson = await req.json();
  const { _id, name, dept, mail, userType, isSuperAdmin, college, phoneNumber } = valueToJson; // Include new fields

  try {
    const existingUser = await User.findById(_id);

    if (!existingUser) {
      logger(user._id, "Update User", "User not found", 404);
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    // Update the user details with new schema fields
    existingUser.name = name;
    existingUser.dept = dept;
    existingUser.email = mail;
    existingUser.userType = userType;
    existingUser.isSuperAdmin = isSuperAdmin ? 1 : 0;
    existingUser.college = college;
    existingUser.phoneNumber = phoneNumber; // Update new field

    await existingUser.save();
    logger(user._id, "Update User", "User Updated", 200);

    return NextResponse.json({ message: "User updated." }, { status: 200 });
  } catch (error) {
    logger(user._id, "Update User", error, 500);
    console.error('Error updating user: ', error);
    return NextResponse.json(
      { message: "An error occurred while updating user." },
      { status: 500 }
    );
  }
}
