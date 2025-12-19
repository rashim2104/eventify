import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ParentBlock from '@/models/parentBlock';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// GET all parent blocks
export async function GET(req) {
  const ACTION = 'Get Parent Blocks';

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
    const parentBlocks = await ParentBlock.find(query).sort({ name: 1 });

    await logger('SYSTEM', ACTION, 'Parent Blocks Fetched Successfully', 200);
    return NextResponse.json({ parentBlocks }, { status: 200 });
  } catch (error) {
    await logger(
      'SYSTEM',
      ACTION,
      'Parent Blocks Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching parent blocks.' },
      { status: 500 }
    );
  }
}

// POST create new parent block
export async function POST(req) {
  const ACTION = 'Add Parent Block';
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
    const parentBlock = await ParentBlock.create(data);

    await logger(
      user._id,
      ACTION,
      `Parent Block Created Successfully - ID: ${parentBlock._id}`,
      201
    );
    return NextResponse.json(
      { message: 'Parent Block Created', parentBlock },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      await logger(
        user._id,
        ACTION,
        'Parent Block Creation Failed: Duplicate name',
        400
      );
      return NextResponse.json(
        { message: 'A parent block with this name already exists.' },
        { status: 400 }
      );
    }
    await logger(
      user._id,
      ACTION,
      'Parent Block Creation Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while creating parent block.' },
      { status: 500 }
    );
  }
}
