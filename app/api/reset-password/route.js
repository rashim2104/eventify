import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';
import { validatePasswordStrength } from '@/lib/passwordValidation';

export async function POST(req) {
  const ACTION = 'Password Reset';
  let user;

  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      await logger('UNKNOWN', ACTION, 'Token and password are required', 400);
      return NextResponse.json(
        { message: 'Token and password are required' },
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

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      await logger(
        user._id,
        ACTION,
        'Password strength validation failed during reset',
        400
      );
      return NextResponse.json(
        {
          message: 'Password does not meet security requirements',
          errors: passwordValidation.errors,
          score: passwordValidation.score,
        },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    );

    await logger(
      user._id,
      ACTION,
      'Password successfully reset via email link',
      200
    );

    return NextResponse.json(
      {
        message:
          'Password has been successfully reset. You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    await logger(
      'UNKNOWN',
      ACTION,
      'Password reset failed: ' + error.message,
      500
    );
    console.log('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
