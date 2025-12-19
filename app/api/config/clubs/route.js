import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Club from '@/models/club';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// GET all clubs
export async function GET(req) {
  const ACTION = 'Get Clubs';

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
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const query = activeOnly ? { isActive: true } : {};
    const clubs = await Club.find(query).sort({ name: 1 });

    await logger('SYSTEM', ACTION, 'Clubs Fetched Successfully', 200);
    return NextResponse.json({ clubs }, { status: 200 });
  } catch (error) {
    await logger('SYSTEM', ACTION, 'Clubs Fetch Failed: ' + error.message, 500);
    return NextResponse.json(
      { message: 'An error occurred while fetching clubs.' },
      { status: 500 }
    );
  }
}

// POST create new club
export async function POST(req) {
  const ACTION = 'Add Club';
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

  if (user.userType !== 'admin') {
    await logger(user._id, ACTION, 'Authorization Failed: Not Admin', 403);
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
    const data = await req.json();
    const club = await Club.create(data);

    await logger(
      user._id,
      ACTION,
      `Club Created Successfully - ID: ${club._id}`,
      201
    );
    return NextResponse.json(
      { message: 'Club Created', club },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      await logger(
        user._id,
        ACTION,
        'Club Creation Failed: Duplicate code',
        400
      );
      return NextResponse.json(
        { message: 'A club with this code already exists.' },
        { status: 400 }
      );
    }
    await logger(
      user._id,
      ACTION,
      'Club Creation Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while creating club.' },
      { status: 500 }
    );
  }
}
