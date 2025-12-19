import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import Reservation from '@/models/reservation';

export async function GET() {
  // Database connection
  try {
    await connectMongoDB();
  } catch (error) {
    return NextResponse.json(
      { message: 'Database connection failed', details: error.message },
      { status: 500 }
    );
  }

  // Fetch approved events for the next 30 days (ongoing + upcoming)
  try {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Convert to ISO strings for comparison (dates are stored as ISO strings in DB)
    const nowISO = now.toISOString();
    const thirtyDaysLaterISO = thirtyDaysLater.toISOString();

    const events = await Events.find({
      status: 2, // Only approved events
      'eventData.EndTime': { $gte: nowISO }, // Event hasn't ended yet (ongoing or upcoming)
      'eventData.StartTime': { $lte: thirtyDaysLaterISO }, // Starts within next 30 days
    })
      .select(
        '_id eventData.EventName eventData.StartTime eventData.EndTime eventData.EventVenue eventData.eventVenueAddInfo eventData.venueList'
      )
      .lean();

    // For events with venueList containing reservation IDs, fetch and populate venue names
    const eventsWithVenueNames = await Promise.all(
      events.map(async event => {
        const venueList = event.eventData?.venueList;

        // Check if venueList exists and contains string IDs (reservation IDs)
        if (venueList && venueList.length > 0) {
          const firstItem = venueList[0];

          // If venueList contains strings (MongoDB ObjectId strings), fetch reservation details
          if (typeof firstItem === 'string') {
            try {
              const reservations = await Reservation.find({
                _id: { $in: venueList },
              })
                .select('venueId venueName reservationDate reservationSession')
                .lean();

              // Convert reservations to venue objects with proper structure
              const populatedVenueList = reservations.map(res => ({
                venueId: res.venueId,
                venueName: res.venueName,
                reservationDate: res.reservationDate,
                reservationSession: res.reservationSession,
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

    return NextResponse.json({ message: eventsWithVenueNames }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching data.' },
      { status: 500 }
    );
  }
}
