import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Department from '@/models/department';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// PUT update department
export async function PUT(req, { params }) {
  const ACTION = 'Update Department';
  let user;
  const { id } = params;

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
    const department = await Department.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!department) {
      await logger(user._id, ACTION, `Department Not Found - ID: ${id}`, 404);
      return NextResponse.json(
        { message: 'Department not found' },
        { status: 404 }
      );
    }

    await logger(
      user._id,
      ACTION,
      `Department Updated Successfully - ID: ${id}`,
      200
    );
    return NextResponse.json(
      { message: 'Department Updated', department },
      { status: 200 }
    );
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Department Update Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while updating department.' },
      { status: 500 }
    );
  }
}

// DELETE department
export async function DELETE(req, { params }) {
  const ACTION = 'Delete Department';
  let user;
  const { id } = params;

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
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      await logger(user._id, ACTION, `Department Not Found - ID: ${id}`, 404);
      return NextResponse.json(
        { message: 'Department not found' },
        { status: 404 }
      );
    }

    await logger(
      user._id,
      ACTION,
      `Department Deleted Successfully - ID: ${id}`,
      200
    );
    return NextResponse.json(
      { message: 'Department Deleted' },
      { status: 200 }
    );
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Department Deletion Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while deleting department.' },
      { status: 500 }
    );
  }
}
