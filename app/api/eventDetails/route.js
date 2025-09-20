import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Event Details';
  let user;

  try {
    user = await authenticate(req);
  } catch (error) {
    await logger(
      'UNKNOWN',
      ACTION,
      'Authentication Failed: ' + error.message,
      401
    );
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 401 }
    );
  }

  try {
    await connectMongoDB();
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Database Connection Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'Database connection failed' },
      { status: 500 }
    );
  }

  try {
    const { eventId } = await req.json();
    let eventDetails;

    if (user.userType !== 'student') {
      eventDetails = await Events.find({ _id: eventId });
    }

    await logger(
      user._id,
      ACTION,
      `Event Details Fetched Successfully - ID: ${eventId}`,
      200
    );
    return NextResponse.json({ message: eventDetails }, { status: 200 });
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Event Details Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}
