// API route for creating a new event
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import { authenticate } from '@/lib/authenticate';
import { authOptions } from '../auth/[...nextauth]/route';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'My Events';
  let user;

  try {
    user = await authenticate(req, authOptions);
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
    const userEvents = await Events.find({ user_id: user._id });
    await logger(
      user._id,
      ACTION,
      `Events Fetched Successfully - Count: ${userEvents.length}`,
      200
    );
    return NextResponse.json({ message: userEvents }, { status: 200 });
  } catch (error) {
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
