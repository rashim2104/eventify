import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reservation from "@/models/reservation";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  const ACTION = "Fetch Venue Reservations";
  let user;

  try {
    user = await authenticate(req);
  } catch (error) {
    await logger("UNKNOWN", ACTION, "Authentication Failed: " + error.message, 401);
    return NextResponse.json({ message: "Authentication failed" }, { status: 401 });
  }

  try {
    await connectMongoDB();
  } catch (error) {
    await logger(user._id, ACTION, "Database Connection Failed: " + error.message, 500);
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
  }

  try {
    const { venue, status, dateFrom, dateTo } = await req.json();
    let query = {};

    // Apply venue filter
    if (venue) {
      query.venueId = venue;
    }

    // Apply date filters
    if (dateFrom || dateTo) {
      query.reservationDate = {};
      if (dateFrom) {
        // Parse the date and set to start of day
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        query.reservationDate.$gte = fromDate;
      }
      if (dateTo) {
        // Parse the date and set to end of day
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.reservationDate.$lte = toDate;
      }
    }


    // Get all reservations matching the filters
    const reservations = await Reservation.find(query)
      .sort({ reservationDate: 1 })
      .lean();


    // Convert dates to readable format before sending
    const formattedReservations = reservations.map(res => ({
      ...res,
      reservationDate: new Date(res.reservationDate).toISOString(),
    }));

    // Filter by status if needed
    const now = new Date();
    const filteredReservations = status === "all" 
      ? formattedReservations
      : formattedReservations.filter(res => {
          const resDate = new Date(res.reservationDate);
          switch(status) {
            case "upcoming": return resDate > now;
            case "past": return resDate < now;
            case "ongoing": return resDate.toDateString() === now.toDateString();
            default: return true;
          }
        });

    await logger(user._id, ACTION, "Reservations Fetched Successfully", 200);
    return NextResponse.json({ reservations: filteredReservations }, { status: 200 });

  } catch (error) {
    await logger(user._id, ACTION, "Fetch Failed: " + error.message, 500);
    return NextResponse.json(
      { message: "An error occurred while fetching reservations" },
      { status: 500 }
    );
  }
}
