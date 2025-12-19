import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Club from '@/models/club';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// PUT update club
export async function PUT(req, { params }) {
  const ACTION = 'Update Club';
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
    const club = await Club.findByIdAndUpdate(id, data, { new: true });

    if (!club) {
      await logger(user._id, ACTION, `Club Not Found - ID: ${id}`, 404);
      return NextResponse.json({ message: 'Club not found' }, { status: 404 });
    }

    await logger(
      user._id,
      ACTION,
      `Club Updated Successfully - ID: ${id}`,
      200
    );
    return NextResponse.json(
      { message: 'Club Updated', club },
      { status: 200 }
    );
  } catch (error) {
    await logger(user._id, ACTION, 'Club Update Failed: ' + error.message, 500);
    return NextResponse.json(
      { message: 'An error occurred while updating club.' },
      { status: 500 }
    );
  }
}

// DELETE club
export async function DELETE(req, { params }) {
  const ACTION = 'Delete Club';
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
    const club = await Club.findByIdAndDelete(id);

    if (!club) {
      await logger(user._id, ACTION, `Club Not Found - ID: ${id}`, 404);
      return NextResponse.json({ message: 'Club not found' }, { status: 404 });
    }

    await logger(
      user._id,
      ACTION,
      `Club Deleted Successfully - ID: ${id}`,
      200
    );
    return NextResponse.json({ message: 'Club Deleted' }, { status: 200 });
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Club Deletion Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while deleting club.' },
      { status: 500 }
    );
  }
}
