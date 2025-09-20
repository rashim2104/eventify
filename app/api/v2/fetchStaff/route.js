import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Fetch Staff Details';
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
    const rawBody = await req.text();
    const valueToJson = JSON.parse(rawBody);
    const { staffId } = valueToJson;

    if (!staffId) {
      await logger(user._id, ACTION, 'Missing Staff ID', 400);
      return NextResponse.json(
        { message: 'Missing staffId in request body' },
        { status: 400 }
      );
    }

    const staff = await User.findOne({ id: staffId });

    if (!staff) {
      await logger(user._id, ACTION, `Staff Not Found: ${staffId}`, 404);
      return NextResponse.json({ message: 'Staff not found' }, { status: 404 });
    }

    const filteredStaffDetails = {
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
    };

    await logger(
      user._id,
      ACTION,
      `Staff Details Fetched Successfully - ID: ${staffId}`,
      200
    );
    return NextResponse.json(
      { message: 'Staff fetched successfully', staff: filteredStaffDetails },
      { status: 200 }
    );
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Staff Details Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching staff details' },
      { status: 500 }
    );
  }
}
