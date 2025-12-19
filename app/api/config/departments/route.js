import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Department from '@/models/department';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// GET all departments
export async function GET(req) {
  const ACTION = 'Get Departments';

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
    const college = searchParams.get('college');
    const activeOnly = searchParams.get('active') !== 'false';

    const query = {};
    // Use case-insensitive regex for college filter
    if (college) query.college = { $regex: new RegExp(`^${college}$`, 'i') };
    if (activeOnly) query.isActive = true;

    const departments = await Department.find(query).sort({
      college: 1,
      name: 1,
    });

    await logger('SYSTEM', ACTION, 'Departments Fetched Successfully', 200);
    return NextResponse.json({ departments }, { status: 200 });
  } catch (error) {
    await logger(
      'SYSTEM',
      ACTION,
      'Departments Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching departments.' },
      { status: 500 }
    );
  }
}

// POST create new department
export async function POST(req) {
  const ACTION = 'Add Department';
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
    const department = await Department.create(data);

    await logger(
      user._id,
      ACTION,
      `Department Created Successfully - ID: ${department._id}`,
      201
    );
    return NextResponse.json(
      { message: 'Department Created', department },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      await logger(
        user._id,
        ACTION,
        'Department Creation Failed: Duplicate code for this college',
        400
      );
      return NextResponse.json(
        {
          message:
            'A department with this code already exists for this college.',
        },
        { status: 400 }
      );
    }
    await logger(
      user._id,
      ACTION,
      'Department Creation Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while creating department.' },
      { status: 500 }
    );
  }
}
