import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Venues from '@/models/venue';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'All Venues';
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
    const userVenues = await Venues.find({});
    await logger(user._id, ACTION, 'Venues Fetched Successfully', 200);
    return NextResponse.json({ message: userVenues }, { status: 200 });
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Venues Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const ACTION = 'Get All Venues';

  try {
    await connectMongoDB();
  } catch (error) {
    await logger(
      'SYSTEM',
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
    const venues = await Venues.find({});
    await logger('SYSTEM', ACTION, 'Venues Fetched Successfully', 200);
    return NextResponse.json({ venues }, { status: 200 });
  } catch (error) {
    await logger(
      'SYSTEM',
      ACTION,
      'Venues Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}
