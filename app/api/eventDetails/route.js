import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import Reservation from '@/models/reservation';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Event Details';
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
    const { eventId } = await req.json();
    let eventDetails;

    if (user.userType !== 'student') {
      eventDetails = await Events.find({ _id: eventId }).lean();

      // Populate venue reservations for each event
      for (const event of eventDetails) {
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

              // Create a map for quick lookup
              const reservationMap = {};
              reservations.forEach(res => {
                reservationMap[res._id.toString()] = res;
              });

              // Update the event's venueList with populated data
              event.eventData.venueList = venueList.map(id =>
                reservationMap[id] || { _id: id, venueName: 'N/A', reservationDate: 'N/A', reservationSession: 'N/A', venueId: 'N/A' }
              );
            } catch {
              // If fetching reservations fails, keep the original venueList
              console.error('Error fetching reservations for event:', event._id);
            }
          }
        }
      }
    }

    await logger(
      user._id,
      ACTION,
      `Event Details Fetched Successfully - ID: ${eventId}`,
      200
    );
    return NextResponse.json({ message: eventDetails }, { status: 200 });
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Event Details Fetch Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}
