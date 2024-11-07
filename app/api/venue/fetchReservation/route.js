// API route for creating a new user
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Reservation from "@/models/reservation";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {


  let user = {
    _id: "615c4e3a1b8c6f001f1e9f9b",
    name: "admin",
    userType: "admin"
  }
  // user = await authenticate(req);
  
  await connectMongoDB();

  let valueToJson = await req.json();

  try {
    const reservationDetails = await Reservation.find({ _id: { $in: valueToJson.resList } });

    logger(user._id,"Fetch Reservations","Fetched Successfully",200);
    return NextResponse.json({ message: reservationDetails }, { status: 200 });
  } catch (error) {
    logger(user._id,"Fetch Reservations",error,500);
    console.error('Error Reservations: ', error);
    return NextResponse.json(
      { message: "An error occurred while fetching details." },
      { status: 500 }
    );
  }
}
