// API route for creating a new user
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Venue from '@/models/venue';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Add Venue';
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

  if (user.isSuperAdmin === 0) {
    await logger(
      user._id,
      ACTION,
      'Authorization Failed: Not Super Admin',
      403
    );
    return NextResponse.json(
      { message: 'You are not authorized to perform this action.' },
      { status: 403 }
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
    const createdVenue = await Venue.create(valueToJson);

    await logger(
      user._id,
      ACTION,
      `Venue Created Successfully - ID: ${createdVenue._id}`,
      201
    );
    return NextResponse.json({ message: 'Venue Created' }, { status: 201 });
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Venue Creation Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while creating venue' },
      { status: 500 }
    );
  }
}
