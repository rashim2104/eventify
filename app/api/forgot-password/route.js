import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import User from '@/models/user';
import { logger } from '@/lib/logger';
import { sendPasswordResetEmail } from '@/lib/mail';
import crypto from 'crypto';

export async function POST(req) {
  const ACTION = 'Forgot Password Request';
  let user;

  try {
    const { email } = await req.json();

    if (!email) {
      await logger('UNKNOWN', ACTION, 'Email is required', 400);
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectMongoDB();

    // Find user by email
    user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if email exists or not
      await logger(
        'UNKNOWN',
        ACTION,
        'Password reset email sent (email not found)',
        200
      );
      return NextResponse.json(
        {
          message:
            'If an account with this email exists, you will receive a password reset link shortly.',
        },
        { status: 200 }
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    await User.updateOne(
      { email: user.email },
      {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      }
    );

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      await logger(
        user._id,
        ACTION,
        'Password reset email sent successfully',
        200
      );

      return NextResponse.json(
        {
          message:
            'If an account with this email exists, you will receive a password reset link shortly.',
        },
        { status: 200 }
      );
    } catch (emailError) {
      await logger(
        user._id,
        ACTION,
        'Failed to send password reset email',
        500
      );
      console.error('Email error:', emailError);

      return NextResponse.json(
        {
          message:
            'Unable to send password reset email. Please try again later.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    await logger(
      'UNKNOWN',
      ACTION,
      'Forgot password request failed: ' + error.message,
      500
    );
    console.log('Forgot password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
