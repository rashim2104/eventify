// API route for creating a new user
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {

  // Authenticate the user
  let user;
  // try {
    user = await authenticate(req, authOptions);
  //   // Continue with your logic here
  // } catch (error) {
  //   return NextResponse.json(
  //     { message: error.message },
  //     { status: 401 }
  //   );
  // }  
  // if(user.isSuperAdmin === 0) {
  //   return NextResponse.json(
  //     { message: "You are not authorized to perform this action." },
  //     { status: 401 }
  //   );
  // }
  // Ensure database connection
  await connectMongoDB();

  let valueToJson = await req.json();

  try {
    const createdVenue = await Venue.create({
      ...valueToJson
    });

    logger(user._id,"Add Venue","Venue Created",201);
    return NextResponse.json({ message: "Venue Created." }, { status: 201 });
  } catch (error) {
    logger(user._id,"Add Venue",error,500);
    console.error('Error Creating Venue: ', error);
    return NextResponse.json(
      { message: "An error occurred while Creating Venue." },
      { status: 500 }
    );
  }
}
