// API route for creating a new event
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import Reservation from '@/models/reservation';
import { authenticate } from '@/lib/authenticate';
import { authOptions } from '../auth/[...nextauth]/route';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'My Events';
  let user;

  try {
    user = await authenticate(req, authOptions);
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
    const userEvents = await Events.find({ user_id: user._id }).lean();

    // For events with venueList containing reservation IDs, fetch and populate venue names
    const eventsWithVenueNames = await Promise.all(
      userEvents.map(async event => {
        const venueList = event.eventData?.venueList;

        // Check if venueList exists and contains string IDs (reservation IDs)
        if (venueList && venueList.length > 0) {
          const firstItem = venueList[0];

          // If venueList contains strings (MongoDB ObjectId strings), fetch reservation details
          if (typeof firstItem === 'string') {
            try {
              const reservations = await Reservation.find({
                _id: { $in: venueList },
              }).lean();

              // Convert reservations to venue objects with proper structure
              const populatedVenueList = reservations.map(res => ({
                venueId: res.venueId,
                venueName: res.venueName,
                reservationDate: res.reservationDate,
                reservationSession: res.reservationSession,
                userId: res.userId,
              }));

              // Update the event's venueList with populated data
              event.eventData.venueList = populatedVenueList;
            } catch (err) {
              // If fetching reservations fails, keep the original venueList
              console.error(
                'Error fetching reservations for event:',
                event._id,
                err
              );
            }
          }
        }

        return event;
      })
    );

    await logger(
      user._id,
      ACTION,
      `Events Fetched Successfully - Count: ${eventsWithVenueNames.length}`,
      200
    );
    return NextResponse.json(
      { message: eventsWithVenueNames },
      { status: 200 }
    );
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Events Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}
