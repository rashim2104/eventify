// API route for creating a new user
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Reservation from '@/models/reservation';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Fetch Reservations';
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
    const valueToJson = await req.json();
    const reservationDetails = await Reservation.find({
      _id: { $in: valueToJson.resList },
    });

    await logger(
      user._id,
      ACTION,
      `Reservations Fetched Successfully - Count: ${reservationDetails.length}`,
      200
    );
    return NextResponse.json({ message: reservationDetails }, { status: 200 });
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Reservations Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching details.' },
      { status: 500 }
    );
  }
}
