// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import eventDetails from "@/app/events/[eventID]/page";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  const user = await authenticate(req);
  // Ensure database connection
  await connectMongoDB();

  const {eventId} = await req.json();
  let eventDetails;
  try {
    if(user.userType !== 'student'){
      //fetch all the events pending for approval
      eventDetails = await Events.find({_id:eventId})
    }
    logger(user._id,"Event Details","Fetched Successfully",200);
    return NextResponse.json({ message: eventDetails }, { status: 200 });
  } catch (error) {
    logger(user._id,"Event Details",error,500);
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}
