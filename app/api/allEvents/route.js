import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  let user;
  try {
    user = await authenticate(req);
    // Continue with your logic here
  } catch (error) {
    logger("Not Auth", "All Events", "Unknown Session" ,401);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
  
  // Ensure database connection
  await connectMongoDB();

  try {
    // Fetch all the events
    let userEvents = await Events.find({ status: 2 });
    logger(user._id, "All Events", "Fetch successful",200);
    return NextResponse.json({ message: userEvents }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    logger(user._id, "All Events",error, 500);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}