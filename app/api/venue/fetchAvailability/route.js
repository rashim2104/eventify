// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Venue from "@/models/venue";
import Reservation from "@/models/reservation";
import { authenticate } from "@/lib/authenticate";
import {logger} from "@/lib/logger";

export async function POST(req) {
  let user;
  try{
  user = await authenticate(req);
  }catch(e){
    logger("Not Auth","Fetch Venue Availability","Not Authorized",401);
    return NextResponse.json(
      { message: "Not Authorized" },
      { status: 401 }
    );
  }
  // let user = {_id : 123}
  let valueToJson = await req.json();
  console.log(valueToJson);
  const dates = valueToJson.selectedSessions.map(item => item.date);

  await connectMongoDB();

  try {
      const venueList = await Venue.find({isAvailable : true});
      const prevReservations = await Reservation.find({
        reservationDate: { $in: dates }
      });
      logger(user._id,"Fetch Venue Availability","Fetched successfully",200);
      return NextResponse.json({ message: {venueList,prevReservations} }, { status: 200 });
  } catch (error) {
    logger(user._id,"Fetch Venue Availability",error,500);
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}
