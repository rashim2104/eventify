import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Fetch Update';
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

  const { _id, dept, userType, college } = user;

  try {
    await connectMongoDB();
  } catch (error) {
    await logger(
      _id,
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
    return await fetchUserEvents(user);
  } catch (error) {
    await logger(_id, ACTION, 'Events Fetch Failed: ' + error.message, 500);
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}

async function fetchUserEvents(user) {
  const { _id, dept, userType, college } = user;
  let userEvents;

  if (userType === 'admin') {
    userEvents = await Events.find({
      $and: [
        { 'eventData.EndTime': { $lt: new Date().toISOString() } },
        { status: 2 },
        { updateStatus: 0 },
        { $or: [{ eventCollege: college }, { eventCollege: 'common' }] },
      ],
    }).select({ 'eventData.EventName': 1, _id: 1 });
  } else if (userType === 'HOD') {
    userEvents = await Events.find({
      $and: [
        { 'eventData.EndTime': { $lt: new Date().toISOString() } },
        { status: 2 },
        { updateStatus: 0 },
        { dept: dept },
        { eventCollege: college },
      ],
    }).select({ 'eventData.EventName': 1, _id: 1 });
  } else if (userType === 'staff') {
    userEvents = await Events.find({
      $and: [
        { 'eventData.EndTime': { $lt: new Date().toISOString() } },
        { status: 2 },
        { updateStatus: 0 },
        { user_id: _id },
      ],
    }).select({ 'eventData.EventName': 1, _id: 1 });
  }

  const userEventNames = userEvents.map(event => ({
    id: event._id,
    eventName: event.eventData.EventName,
  }));

  await logger(
    _id,
    'Fetch Update',
    `Events Fetched Successfully - Count: ${userEventNames.length}`,
    200
  );
  return NextResponse.json({ eventNames: userEventNames }, { status: 200 });
}
