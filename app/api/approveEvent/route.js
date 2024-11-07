// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import User from "@/models/user";
import { sendMail } from "@/lib/mail";
import { authenticate } from "@/lib/authenticate";
import { IdGen } from "@/lib/eventIdGen";
import { logger } from "@/lib/logger";

export async function POST(req) {
  const {
    _id: user_id,
    name: doerName,
    userType,
    email,
  } = await authenticate(req);

  if (userType !== "admin" && userType !== "HOD") {
    logger(user_id, "Approve Event", "Not Authorized", 401); // Changed _id to user_id
    return NextResponse.json(
      { message: "You are not authorized to perform this action." },
      { status: 401 }
    );
  }

  // Ensure database connection
  await connectMongoDB();

  const { event_id, action, comment } = await req.json();
  let userEvents;
  let eventDetails = await Events.findOne({ _id: event_id });
  // let creator = await User.findOne({ _id: eventDetails.user_id });
  // let creatorName = creator.name;
  // let creatorMail = creator.email;

  try {
    if (
      email === "principal@sairam.edu.in" ||
      email === "principal@sairamit.edu.in"
    ) {
      if (action === "Approve") {
        const eventId = await IdGen(
          eventDetails.user_id,
          eventDetails.dept,
          eventDetails.eventCollege
        );
        console.log("Event ID: ", eventId);
        userEvents = await Events.updateOne(
          { _id: event_id },
          { $set: { status: 2, ins_id: eventId } }
        );
      }
    } else {
      if (userType === "admin") {
        // Approval for IQAC
        if (action === "Approve") {
          console.log("Department: ", eventDetails.dept);
          const eventId = await IdGen(
            eventDetails.user_id,
            eventDetails.dept,
            eventDetails.eventCollege
          );
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 2, iqac_id: user_id, ins_id: eventId } }
          );
          // sendMail(
          //   creatorMail,
          //   "approve",
          //   doerName,
          //   eventDetails.eventData.EventName,
          //   event_id,
          //   ""
          // ); // pass creator mail id
        } else if (action === "Reject") {
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: -2, iqac_id: user_id } }
          );
          // sendMail(
          //   creatorMail,
          //   "reject",
          //   doerName,
          //   eventDetails.eventData.EventName,
          //   event_id,
          //   ""
          // ); // pass creator email id
        } else if (action === "Comment") {
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 4, iqac_id: user_id, comment: comment } }
          );
          // sendMail(
          //   creatorMail,
          //   "comment",
          //   doerName,
          //   eventDetails.eventData.EventName,
          //   event_id,
          //   comment
          // ); // pass creator email id
        } else if (action === "ApprovePrinc") {
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 5, iqac_id: user_id } }
          );
          // sendMail(
          //   "rashimrb22@gmail.com",
          //   "create",
          //   creatorName,
          //   eventDetails.eventData.EventName,
          //   event_id,
          //   ""
          // ); // pass principal based on college
        }
      } else if (userType === "HOD") {
        // Approval for HoD
        if (action === "Approve") {
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 1 } }
          );
          // sendMail(
          //   "rashimrb22@gmail.com",
          //   "create",
          //   creatorName,
          //   eventDetails.eventData.EventName,
          //   event_id,
          //   ""
          // ); // pass all iqac based on college
        } else if (action === "Reject") {
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: -1 } }
          );
          // sendMail(
          //   creatorMail,
          //   "reject",
          //   doerName,
          //   eventDetails.eventData.EventName,
          //   event_id,
          //   ""
          // ); // pass creator email id
        } else if (action === "Comment") {
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 3, comment: comment } }
          );
          // sendMail(
          //   creatorMail,
          //   "comment",
          //   doerName,
          //   eventDetails.eventData.EventName,
          //   event_id,
          //   comment
          // ); // pass creator email id
        }
      }
    }
    logger(user_id, "Approve event", "Success", 200); // Changed _id to user_id
    return NextResponse.json({ message: userEvents }, { status: 200 });
  } catch (error) {
    logger(user_id, "Approve event", error, 500); // Changed _id to user_id
    console.error("Error approving event:", error);
    return NextResponse.json(
      { message: "An error occurred while approving event." },
      { status: 500 }
    );
  }
}
