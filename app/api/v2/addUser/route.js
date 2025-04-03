import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req) {
  const ACTION = "Add User";

  // Authentication check
  let user;
  try {
    user = await authenticate(req, authOptions);
  } catch (error) {
    await logger(
      "UNKNOWN",
      ACTION,
      "Authentication Failed: " + error.message,
      401
    );
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    );
  }

  // Authorization check
  if (user.isSuperAdmin === 0) {
    await logger(
      user._id,
      ACTION,
      "Authorization Failed: Not a super admin",
      403
    );
    return NextResponse.json(
      { message: "You are not authorized to perform this action." },
      { status: 403 }
    );
  }

  // Database connection
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

  // Parse request body
  let valueToJson;
  try {
    valueToJson = await req.json();
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      "Invalid Request Body: " + error.message,
      400
    );
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  return handleUserCreation(user, valueToJson, ACTION);
}

async function    handleUserCreation(user, valueToJson, ACTION) {
  const { name, dept, mail, password, userType, isSuperAdmin, college, role, phone, id } = valueToJson;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email: mail });
    if (existingUser) {
      await logger(
        user._id,
        ACTION,
        `User Creation Failed: Email ${mail} already exists`,
        409
      );
      return NextResponse.json(
        { message: "Email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const createdUser = await User.create({
      name,
      dept,
      college,
      email: mail,
      password: hashedPassword,
      userType,
      isSuperAdmin: isSuperAdmin ? 1 : 0,
      role,
      phone,
      id,
    });

    await logger(
      user._id,
      ACTION,
      `User Created Successfully: ${mail}`,
      201
    );

    return NextResponse.json(
      { message: "User Created." },
      { status: 201 }
    );

  } catch (error) {
    await logger(
      user._id,
      ACTION,
      `User Creation Failed: ${error.message}`,
      500
    );
    console.error('Error Creating User:', error);
    return NextResponse.json(
      { message: "An error occurred while creating user." },
      { status: 500 }
    );
  }
}
