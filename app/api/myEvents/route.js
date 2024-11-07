// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from '@/lib/authenticate';
import { authOptions } from "../auth/[...nextauth]/route";
import  {logger} from "@/lib/logger";

export async function POST(req, res) {
  let user;
  try {
    user = await authenticate(req, authOptions);
    // Continue with your logic here
  } catch (error) {
    logger("Not Auth","My Events","Unknown session",401);
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    );
  }
  // Ensure database connection
  await connectMongoDB();
  let userEvents;
  try {
    // Fetch all the events created by the user.
    userEvents = await Events.find({ user_id: user._id });
    logger(user._id,"My Events","Fetch Success",200);
    return NextResponse.json({ message: userEvents }, { status: 200 });
  } catch (error) {
    logger(user._id,"My Events",error,500);
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}
