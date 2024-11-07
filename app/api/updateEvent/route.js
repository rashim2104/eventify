// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  // Authenticate the Request
  const { _id: user_id } = await authenticate(req);
  // Ensure database connection
  await connectMongoDB(); 

  let valueToJson = await req.json();

  const { jsonData } =  valueToJson;
  
  try {
    // Insert the event into the collection
    const updatedEvent = await Events.updateOne(
      { _id: jsonData.selectedEvent },
      {
        updateStatus: 1,
        postEventUpdateOn: new Date(),
        postEventUpdateBy: user_id,
        postEventData: jsonData,
      }
    );

    if (updatedEvent) {
      logger(user_id, "Update Event", "Event Updated", 200);
      return NextResponse.json({ message: "Event Updated." }, { status: 200 });
    } else {
      logger(user_id, "Update Event", "Event Not Found",500);
      return NextResponse.json({ message: "Event not found." }, { status: 500 });
    }
  } catch (error) {
    logger(user_id, "Update Event", error, 500);
    console.error('Error updating event:', error);
    return NextResponse.json(
      { message: "An error occurred while updating the event." },
      { status: 500 }
    );
  }
}
