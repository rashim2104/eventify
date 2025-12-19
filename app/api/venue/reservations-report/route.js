import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Reservation from '@/models/reservation';
import Events from '@/models/events';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Fetch Venue Reservations Report';
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
    const { startDate, endDate, status, venueIds } = await req.json();

    const fromDate = startDate ? new Date(startDate) : null;
    const toDate = endDate ? new Date(endDate) : null;

    let eventQuery = {};
    if (fromDate && toDate) {
      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];

      eventQuery = {
        'eventData.StartTime': {
          $gte: fromDateStr,
          $lte: toDateStr + 'T23:59:59',
        },
      };
    }

    const events = await Events.find(eventQuery).lean();

    const allReservationIds = [];
    events.forEach(event => {
      if (Array.isArray(event?.eventData?.venueList)) {
        allReservationIds.push(...event.eventData.venueList);
      }
    });

    const reservations = await Reservation.find({
      _id: { $in: allReservationIds },
    }).lean();

    const reservationMap = new Map();
    reservations.forEach(res => {
      reservationMap.set(res._id.toString(), res);
    });

    const grouped = [];
    let totalReservationsProcessed = 0;
    let totalReservationsFiltered = 0;

    events.forEach(event => {
      const venueList = event?.eventData?.venueList || [];
      const eventReservations = [];

      venueList.forEach(reservationId => {
        const reservation = reservationMap.get(reservationId.toString());
        if (!reservation) return;

        totalReservationsProcessed++;

        if (
          venueIds &&
          venueIds.length > 0 &&
          !venueIds.includes(reservation.venueId)
        ) {
          return;
        }

        const [dd, mm, yy] = (reservation.reservationDate || '').split('-');
        let statusText = '-';

        if (event.status !== 2) {
          statusText = 'Pending Approval';
        } else if (yy && mm && dd) {
          const resDate = new Date(`20${yy}-${mm}-${dd}`);
          const now = new Date();
          if (!isNaN(resDate.getTime())) {
            if (resDate.toDateString() === now.toDateString()) {
              statusText = 'Ongoing';
            } else if (resDate > now) {
              statusText = 'Upcoming';
            } else {
              statusText = 'Past';
            }
          }
        }

        if (status && status !== 'all') {
          const normalizedStatus = statusText.toLowerCase().replace(' ', '');
          const normalizedFilter = status.toLowerCase().replace(' ', '');
          if (normalizedStatus !== normalizedFilter) {
            return;
          }
        }

        totalReservationsFiltered++;

        eventReservations.push({
          _id: reservation._id,
          venueId: reservation.venueId,
          venueName: reservation.venueName,
          reservationDate: reservation.reservationDate,
          reservationSession: reservation.reservationSession,
          statusText,
          reservationDateKey: `20${yy}-${mm}-${dd}`,
        });
      });

      if (eventReservations.length > 0) {
        grouped.push({
          eventId: event._id,
          eventName: event?.eventData?.EventName || 'Unnamed Event',
          ins_id: event?.ins_id || null,
          reservations: eventReservations,
        });
      }
    });

    await logger(
      user._id,
      ACTION,
      `Generated report: ${grouped.length} events, ${totalReservationsFiltered} reservations`,
      200
    );

    return NextResponse.json({
      success: true,
      events: grouped,
      totalEvents: grouped.length,
      totalReservations: totalReservationsFiltered,
    });
  } catch (error) {
    await logger(
      user._id,
      ACTION,
      'Report Generation Failed: ' + error.message,
      500
    );
    return NextResponse.json(
      { message: 'Failed to generate report', error: error.message },
      { status: 500 }
    );
  }
}
