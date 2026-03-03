import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Grant Post-Event Override';
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
    await logger(user._id, ACTION, 'Not authorized', 403);
    return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
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
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { message: 'userId is required' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    await User.updateOne(
      { _id: userId },
      {
        $inc: { postEventOverrideCount: 1 },
        $set: {
          lastOverrideGrantedBy: user._id,
          lastOverrideGrantedAt: new Date(),
        },
      }
    );

    await logger(
      user._id,
      ACTION,
      `Override granted to user ${userId} (${targetUser.name}). New count: ${(targetUser.postEventOverrideCount || 0) + 1}`,
      200
    );

    return NextResponse.json(
      { message: 'Override granted successfully' },
      { status: 200 }
    );
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Grant Override Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'Failed to grant override' },
      { status: 500 }
    );
  }
}
