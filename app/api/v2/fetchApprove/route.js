import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
  const ACTION = "Fetch Approve";
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

  const { _id: user_id, userType, dept, college, email } = user;

  try {
    await connectMongoDB();
  } catch (error) {
    await logger(
      user_id,
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
    return await fetchEvents(user_id, userType, dept, college, email);
  } catch (error) {
    await logger(user_id, ACTION, "Events Fetch Failed: " + error.message, 500);
    return NextResponse.json(
      { message: "An error occurred while fetching data." },
      { status: 500 }
    );
  }
}

async function fetchEvents(user_id, userType, dept, college, email) {
  let userEvents;
  const ACTION = "Fetch Approve";

  if (
    email === "principal@sairamit.edu.in" ||
    email === "principal@sairam.edu.in"
  ) {
    userEvents = await Events.find({
      $and: [
        { status: 5 },
        { $or: [{ eventCollege: college }, { eventCollege: "common" }] },
      ],
    });
  } else if (userType === "admin") {
    userEvents = await Events.find({
      $and: [
        { $or: [{ eventCollege: college }, { eventCollege: "common" }] },
        { status: 1 },
      ],
    });
  } else if (userType === "HOD") {
    if (
      email === "hodscihum@sairamit.edu.in" ||
      email === "hod.sh@sairam.edu.in"
    ) {
      userEvents = await Events.find({
        $and: [
          {
            $or: [
              { dept: "TA" },
              { dept: "EN" },
              { dept: "MA" },
              { dept: "PH" },
              { dept: "CH" },
            ],
          },
          { eventCollege: college },
          { status: 0 },
        ],
      });
    } else {
      userEvents = await Events.find({
        $and: [{ dept: dept }, { eventCollege: college }, { status: 0 }],
      });
    }
  }

  await logger(
    user_id,
    ACTION,
    `Events Fetched Successfully - Count: ${userEvents.length}`,
    200
  );
  return NextResponse.json({ message: userEvents }, { status: 200 });
}
