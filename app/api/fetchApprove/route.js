// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import {logger} from "@/lib/logger";

export async function POST(req) {
  let user;
  try {
    user = await authenticate(req);
    // Continue with your logic here
  } catch (error) {
    logger("Not Auth", "Create Event", error, 401);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
  const {_id: user_id, userType, dept, college, email} = await authenticate(req);
  // Ensure database connection
  await connectMongoDB();

  let userEvents;
  try {
    if(email === "principal@sairamit.edu.in" || email === "principal@sairam.edu.in"){
      userEvents = await Events.find({
        $and: [
          { status: 5 },
          { $or: [{ eventCollege: college }, { eventCollege: "common" }] }
        ]
      });
    }
    else{
    if(userType === 'admin'){
      //fetch all the events pending for approval
      userEvents = await Events.find({
        $and: [
          {
            $or: [
              { eventCollege: college },
              { eventCollege: "common" }
            ]
          },
          { status: 1 }
        ]
      });
    }
    else if(userType === 'HOD'){
      //Fetch all the dept events pending for approval

      //check if the event is under S&H
      if(email === "hodscihum@sairamit.edu.in" || email === "hod.sh@sairam.edu.in"){
        userEvents = await Events.find({$and:[{$or:[{dept: 'TA'},{dept: 'EN'},{dept: 'MA'},{dept: 'PH'},{dept: 'CH'},]},{eventCollege: college},{status:0}]});
        logger(user._id,"Fetch Approve","Fetched Successfully",200);
        return NextResponse.json({ message: userEvents }, { status: 200 });
      }
      userEvents = await Events.find({$and:[{dept: dept},{eventCollege: college},{status:0}]})
    }}
    logger(user._id,"Fetch Approve","Fetched Successfully",200);
    return NextResponse.json({ message: userEvents }, { status: 200 });
  } catch (error) {
    logger(user._id,"Fetch Approve",error,500);
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}
