import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { clubsShort, societies, ieeeSocietiesShort } from "@/public/data/data";
import { Yesteryear } from "next/font/google";
import { logger } from "@/lib/logger";

export async function POST(req) {
  try {
    const user = await authenticate(req);
    if (user.userType !== "HOD" && user.userType !== "admin") {
      logger(user._id,"Filter Event","Not Authorized",401);
      return NextResponse.json(
        { message: "You are not authorized to view this page." },
        { status: 401 }
      );
    }
    // Ensure database connection
    await connectMongoDB();

  const statusMapping = {
  "Created": [0],
  "Approved": [1,2],
  "Rejected": [-1, -2],
  "Marked for change" : [3,4],
};

const data = await req.json();

let userEvents;
let query = {};

if(user.userType === 'HOD'){
  if (!data.eventStatus.includes("All")) {
    // Map the eventStatus values to the actual values and flatten the array
    const actualEventStatus = data.eventStatus.flatMap(status => statusMapping[status]);

    // Use the actualEventStatus in the query
    if (actualEventStatus.length > 0) {
      query.status = { $in: actualEventStatus };
    }
  }
  console.log(user.college);
  query.eventCollege = {$in: user.college};
  query.dept = user.dept;
}else{
  console.log(data)
  query.eventCollege = {$in: data.eventCollege};
  if(data.organizer === 'aicte'){
    query['eventData.EventOrganizer'] = "5";
  }else if(data.organizer === 'others'){
    query['eventData.EventOrganizer'] = "4";
  }else{
    query.dept = data.department;
  }
}

query['eventData.StartTime'] = {
  $gte: data.startDate + "T00:00",
  $lt: data.endDate + "T23:59"
};


    // Fetch events from the database with the specified conditions
    userEvents = await Events.find(query).select({ "eventData.EventName": 1 });
    logger(user._id,"Filter Event","Filter Success",200);
    // Return the event details
    return NextResponse.json({ events: userEvents }, { status: 200 });
  } catch (error) {
    logger(user._id,"Filter Event",error,500);
    console.error("Error searching events:", error);
    return NextResponse.json(
      { message: "An error occurred while searching events." },
      { status: 500 }
    );
  }
}
