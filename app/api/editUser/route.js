import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Update User';
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

  if (!user.isSuperAdmin) {
    await logger(
      user._id,
      ACTION,
      'Authorization Failed: Not Super Admin',
      403
    );
    return NextResponse.json(
      { message: 'You are not authorized to update a user' },
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
    return await updateUser(user, req);
  } catch (error) {
    await logger(user._id, ACTION, 'User Update Failed: ' + error.message, 500);
    return NextResponse.json(
      { message: 'An error occurred while updating user' },
      { status: 500 }
    );
  }
}

async function updateUser(user, req) {
  const {
    _id,
    name,
    dept,
    mail,
    userType,
    isSuperAdmin,
    college,
    phoneNumber,
  } = await req.json();

  const existingUser = await User.findById(_id);
  if (!existingUser) {
    await logger(user._id, 'Update User', 'User Not Found', 404);
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  existingUser.name = name;
  existingUser.dept = dept;
  existingUser.email = mail;
  existingUser.userType = userType;
  existingUser.isSuperAdmin = isSuperAdmin ? 1 : 0;
  existingUser.college = college;
  existingUser.phoneNumber = phoneNumber;

  await existingUser.save();

  await logger(user._id, 'Update User', 'User Updated Successfully', 200);
  return NextResponse.json({ message: 'User updated' }, { status: 200 });
}
