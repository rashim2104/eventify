// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  const {_id: _id, dept, userType, college} = await authenticate(req);
  // Ensure database connection
  await connectMongoDB();

  let userEventNames;
  let userEvents;

  try {
    // Fetch only the 'eventData.EventName' and '_id' for the specified conditions
    if (userType === "admin") {
      userEvents = await Events.find({
        $and: [
          { "eventData.EndTime": { $lt: new Date().toISOString() } },
          { status: 2 },
          { updateStatus: 0 },
          { $or: [{ eventCollege: college }, { eventCollege: "common" }] },
        ],
      }).select({ "eventData.EventName": 1, _id: 1 });
    } else if (userType === "HOD") {
      userEvents = await Events.find({
        $and: [
          { "eventData.EndTime": { $lt: new Date().toISOString() } },
          { status: 2 },
          { updateStatus: 0 },
          { dept: dept },
          { eventCollege: college },
        ],
      }).select({ "eventData.EventName": 1, _id: 1 });
    } else if (userType === "staff") {
      userEvents = await Events.find({
        $and: [
          { "eventData.EndTime": { $lt: new Date().toISOString() } },
          { status: 2 },
          { updateStatus: 0 },
          { user_id: _id },
        ],
      }).select({ "eventData.EventName": 1, _id: 1 });
    }

    // Extract the event names and ids from the result
    userEventNames = userEvents.map((event) => ({
      id: event._id,
      eventName: event.eventData.EventName,
    }));

    logger(_id, "Fetch Update", "Fetched Successfully", 200);
    return NextResponse.json({ eventNames: userEventNames }, { status: 200 });
  } catch (error) {
    logger(_id, "Fetch Update", error,500);
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}
