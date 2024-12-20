import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function deleteS3File(fileName) {
  if (!fileName) return;

  try {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    };
    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
  } catch (error) {
    console.error(`Failed to delete S3 file: ${fileName}`, error);
    throw error;
  }
}

export async function POST(req) {
  const ACTION = "Delete Event";
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
    return handleDeleteEvent(req, user);
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      "Event Deletion Failed: " + error.message,
      500
    );
    return NextResponse.json(
      { message: "An error occurred while deleting the event" },
      { status: 500 }
    );
  }
}

async function handleDeleteEvent(req, user) {
  const ACTION = "Delete Event";

  const { _id } = await req.json();
  const eventData = await Events.findOne({ _id });

  if (!eventData) {
    await logger(user._id, ACTION, "Event Not Found", 404);
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  if (!eventData.user_id.equals(user._id)) {
    await logger(user._id, ACTION, "Unauthorized Access", 403);
    return NextResponse.json(
      { message: "You are not authorized to delete this event" },
      { status: 403 }
    );
  }

  // Delete S3 files
  try {
    const fileUrls = eventData.eventData.fileUrl;
    if (fileUrls) {
      if (fileUrls.poster) {
        const posterKey = new URL(fileUrls.poster).pathname.slice(1);
        await deleteS3File(posterKey);
      }
      if (fileUrls.sanctionLetter) {
        const letterKey = new URL(fileUrls.sanctionLetter).pathname.slice(1);
        await deleteS3File(letterKey);
      }
    }
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      "Failed to delete S3 files: " + error.message,
      500
    );
    return NextResponse.json(
      { message: "Failed to delete associated files" },
      { status: 500 }
    );
  }

  // Delete event from database
  const deletedEvent = await Events.findOneAndDelete({ _id });

  if (deletedEvent) {
    await logger(
      user._id,
      ACTION,
      `Event Deleted Successfully - ID: ${deletedEvent._id}, Name: ${deletedEvent.eventData.EventName}`,
      200
    );
    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  }
}
