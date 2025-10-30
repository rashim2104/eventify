import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import User from '@/models/user';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Reset Token Validation';
  let user;

  try {
    const { token } = await req.json();

    if (!token) {
      await logger('UNKNOWN', ACTION, 'Token is required', 400);
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectMongoDB();

    // Find user with valid reset token
    user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      await logger('UNKNOWN', ACTION, 'Invalid or expired reset token', 400);
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    await logger(user._id, ACTION, 'Reset token validated successfully', 200);

    return NextResponse.json(
      {
        message: 'Token is valid',
        valid: true,
        expiresAt: user.resetTokenExpiry,
      },
      { status: 200 }
    );
  } catch (error) {
    await logger(
      'UNKNOWN',
      ACTION,
      'Token validation failed: ' + error.message,
      500
    );
    console.log('Token validation error:', error);
    return NextResponse.json(
      { message: 'An error occurred while validating the token.' },
      { status: 500 }
    );
  }
}
