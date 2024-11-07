// API route for creating a new user
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {

  // Authenticate the user
  let user;
  try {
    user = await authenticate(req, authOptions);
  } catch (error) {
    logger("Not Auth", "Add User", "Unknown Session", 401);
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    );
  }
  if (user.isSuperAdmin === 0) {
    logger(user._id, "Add User", "Not Authorized", 401);
    return NextResponse.json(
      { message: "You are not authorized to perform this action." },
      { status: 401 }
    );
  }
  // Ensure database connection
  await connectMongoDB();

  let valueToJson = await req.json();

  const { name, dept, mail, password, userType, isSuperAdmin, college, role, phone, id } = valueToJson;
  try {
    // Encrypt the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the collection
    const existingUser = await User.findOne({ email: mail });

    if (existingUser) {
      logger(user._id, "Add User", " User already exists", 400);
      return NextResponse.json(
        { message: "Email already exists." },
        { status: 500 }
      );
    }

    const createdUser = await User.create({
      name,
      dept,
      college: college,
      email: mail,
      password: hashedPassword,
      userType,
      isSuperAdmin: isSuperAdmin ? 1 : 0,
      role,
      phone,
      id,
    });
    logger(user._id, "Add User", "User Added Successfully", 201);
    return NextResponse.json({ message: "User Created." }, { status: 201 });
  } catch (error) {
    logger(user._id, "Add User", error, 500);
    console.error('Error Creating User: ', error);
    return NextResponse.json(
      { message: "An error occurred while Creating User." },
      { status: 500 }
    );
  }
}
