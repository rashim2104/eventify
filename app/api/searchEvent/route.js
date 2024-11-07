import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  const user = await authenticate(req);
  // Ensure database connection
  await connectMongoDB();

  const { eventName } = await req.json();
  let userEvents;

  try {
    userEvents = await Events.find({
      "eventData.EventName": { $regex: eventName, $options: "i" },
    }).select({ "eventData.EventName": 1});

    // Return the event details
    logger(user._id, "Search Event", "Fetched Successfully ",200);
    return NextResponse.json({ events: userEvents }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    logger(user._id, "Search Event", error, 500);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}
