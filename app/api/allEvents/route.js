import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'All Events';

  // Authentication check
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
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  // Database connection
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

  // Fetch events
  try {
    const userEvents = await Events.find({ status: 2 });
    await logger(user._id, ACTION, 'Events Fetched Successfully', 200);
    return NextResponse.json({ message: userEvents }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    await logger(
      user._id,
      ACTION,
      'Events Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}
