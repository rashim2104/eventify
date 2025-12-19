import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';
import { validatePasswordStrength } from '@/lib/passwordValidation';

export async function POST(req) {
  const ACTION = 'Change Password';
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

  const { email, isSuperAdmin } = user;

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
    console.log('Change Password Request:', {
      action: valueToJson.action,
      _id: valueToJson._id,
    });

    // Validate action is provided
    if (!valueToJson.action) {
      await logger(user._id, ACTION, 'Action not provided in request', 400);
      return NextResponse.json(
        { message: 'Action is required' },
        { status: 400 }
      );
    }

    if (valueToJson.action === 'user') {
      const { oldPassword, newPassword } = valueToJson;
      const user = await User.findOne({ email });

      if (!user) {
        await logger(user._id, ACTION, 'User Not Found', 404);
        return NextResponse.json(
          { message: "User doesn't exist" },
          { status: 404 }
        );
      }

      const passwordsMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordsMatch) {
        await logger(user._id, ACTION, 'Wrong Password', 401);
        return NextResponse.json(
          { message: 'Wrong password' },
          { status: 401 }
        );
      }

      // Add this new validation
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        await logger(
          user._id,
          ACTION,
          'New Password Same as Old Password',
          400
        );
        return NextResponse.json(
          { message: 'New password cannot be the same as old password' },
          { status: 400 }
        );
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        await logger(
          user._id,
          ACTION,
          'Password Strength Validation Failed',
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

      const salt = await bcrypt.genSalt(10);
      const newPasswordHashed = await bcrypt.hash(newPassword, salt);
      await User.updateOne({ email }, { password: newPasswordHashed });

      await logger(user._id, ACTION, 'Password Changed Successfully', 201);

      // Send updated session info
      return NextResponse.json(
        {
          message: 'Password Changed',
          hasDefaultPassword: false,
          user: {
            ...user.toObject(),
            password: newPasswordHashed,
          },
        },
        { status: 201 }
      );
    }

    if (valueToJson.action === 'admin') {
      if (!isSuperAdmin) {
        await logger(
          user._id,
          ACTION,
          'Unauthorized Access: Not Super Admin',
          403
        );
        return NextResponse.json(
          { message: 'You are not authorized to perform this action.' },
          { status: 403 }
        );
      }
      // Validate _id is provided
      if (!valueToJson._id) {
        await logger(user._id, ACTION, 'User ID not provided in request', 400);
        return NextResponse.json(
          { message: 'User ID is required' },
          { status: 400 }
        );
      }

      const existingUser = await User.findById(valueToJson._id);
      if (!existingUser) {
        await logger(user._id, ACTION, 'User Not Found', 404);
        return NextResponse.json(
          { message: 'User not found.' },
          { status: 404 }
        );
      }

      // Check if DEFAULT_PASSWORD is set (plain text password from env)
      console.log('Checking DEFAULT_PASSWORD:', {
        exists: !!process.env.DEFAULT_PASSWORD,
        length: process.env.DEFAULT_PASSWORD?.length,
      });

      if (!process.env.DEFAULT_PASSWORD) {
        try {
          await logger(
            user._id?.toString() || 'UNKNOWN',
            ACTION,
            'DEFAULT_PASSWORD not configured',
            500
          );
        } catch (logError) {
          console.error('Logger error:', logError);
        }
        return NextResponse.json(
          {
            message:
              'Server configuration error. Please contact administrator.',
          },
          { status: 500 }
        );
      }

      // Hash the default password before storing
      const salt = await bcrypt.genSalt(10);
      const hashedDefaultPassword = await bcrypt.hash(
        process.env.DEFAULT_PASSWORD,
        salt
      );

      console.log('Updating password for user:', valueToJson._id);
      // Use updateOne instead of save() to avoid validation issues
      const updateResult = await User.updateOne(
        { _id: valueToJson._id },
        { password: hashedDefaultPassword }
      );

      console.log('Update result:', {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        acknowledged: updateResult.acknowledged,
      });

      if (updateResult.matchedCount === 0) {
        await logger(
          user._id?.toString() || 'UNKNOWN',
          ACTION,
          'User not found for update',
          404
        );
        return NextResponse.json(
          { message: 'User not found for password update.' },
          { status: 404 }
        );
      }

      if (updateResult.modifiedCount === 0) {
        await logger(
          user._id?.toString() || 'UNKNOWN',
          ACTION,
          'Password update did not modify any documents',
          400
        );
        return NextResponse.json(
          {
            message:
              'Password was not updated. It may already be set to the default password.',
          },
          { status: 400 }
        );
      }

      await logger(
        user._id?.toString() || 'UNKNOWN',
        ACTION,
        'Password Reset to Default',
        200
      );
      return NextResponse.json(
        { message: 'Password updated to Welcome@321' },
        { status: 200 }
      );
    }

    // If action doesn't match any handler
    await logger(
      user._id,
      ACTION,
      `Invalid action: ${valueToJson.action}`,
      400
    );
    return NextResponse.json(
      { message: 'Invalid action specified' },
      { status: 400 }
    );
  } catch (error) {
    // Safely log the error
    try {
      await logger(
        user?._id?.toString() || 'UNKNOWN',
        ACTION,
        'Password Change Failed: ' + error.message,
        500
      );
    } catch (logError) {
      console.error('Error logging failed:', logError);
    }

    console.error('Change Password Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        message: 'An error occurred while changing password.',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
