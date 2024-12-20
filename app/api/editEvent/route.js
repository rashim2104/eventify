import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import Reservation from "@/models/reservation";
import Venue from "@/models/venue";
import { logger } from "@/lib/logger";
import { authenticate } from "@/lib/authenticate";

export async function POST(req) {
  const ACTION = "Update Event";
  let user;

  try {
    user = await authenticate(req);
  } catch (error) {
    await logger(
      "UNKNOWN",
      ACTION,
      "Authentication Failed: " + error.message,
      401
    );
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 401 }
    );
  }

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

  try {
    const valueToJson = await req.json();
    const {
      _id,
      user_id,
      userType,
      dept,
      eventData,
      status,
      college,
      venueList,
    } = valueToJson;
    const StartTime = new Date(eventData.StartTime);
    const EndTime = new Date(eventData.EndTime);
    let userStatus = null;

    if (eventData.EventOrganizer == 4 && userType === "admin") {
      userStatus = 2;
    } else if (eventData.EventOrganizer == 4) {
      userStatus = 1;
    } else {
      userStatus = status == 3 ? 0 : status == 4 ? 1 : 0;
    }

    const oldEvent = await Events.findById(_id).populate("eventData.venueList");
    if (!oldEvent) {
      await logger(user._id, ACTION, "Event Not Found", 404);
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    if (oldEvent.eventData.venueList && oldEvent.eventData.venueList.length) {
      await Reservation.deleteMany({
        _id: { $in: oldEvent.eventData.venueList },
      });
    }

    if (!eventData.venueList || !Array.isArray(eventData.venueList)) {
      await logger(user._id, ACTION, "Invalid Venue List", 400);
      return NextResponse.json(
        { message: "Invalid venue list" },
        { status: 400 }
      );
    }

    const venueIds = eventData.venueList.map((v) => v.venueId);
    const venues = await Venue.find({ venueId: { $in: venueIds } });
    const venueMap = venues.reduce((map, venue) => {
      map[venue.venueId] = venue.venueName;
      return map;
    }, {});

    const reservationsWithNames = eventData.venueList.map((v) => ({
      ...v,
      venueName: venueMap[v.venueId],
    }));

    const createdReservations = await Reservation.insertMany(
      reservationsWithNames
    );
    const reservationIds = createdReservations.map((item) =>
      item._id.toString()
    );

    const updatedEvent = await Events.findByIdAndUpdate(
      _id,
      {
        dept,
        eventCollege: college,
        status: userStatus,
        eventData: {
          ...eventData,
          venueList: reservationIds,
        },
        StartTime,
        EndTime,
      },
      { new: true }
    );

    if (updatedEvent) {
      await logger(
        user._id,
        ACTION,
        `Event Updated Successfully - ID: ${updatedEvent._id}, Name: ${updatedEvent.eventData.EventName}`,
        200
      );
      return NextResponse.json({ message: "Event Updated" }, { status: 200 });
    } else {
      await logger(user._id, ACTION, "Event Update Failed: Not Found", 404);
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      "Event Update Failed: " + error.message,
      500
    );
    return NextResponse.json(
      { message: "An error occurred while updating the event" },
      { status: 500 }
    );
  }
}
