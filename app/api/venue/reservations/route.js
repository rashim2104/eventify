import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Reservation from '@/models/reservation';
import Events from '@/models/events';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Fetch Venue Reservations';
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
    const { venue, status, dateFrom, dateTo } = await req.json();
    let query = {};

    // Apply venue filter
    if (venue) {
      query.venueId = venue;
    }

    // Fetch all reservations without date filtering
    const reservations = await Reservation.find(query).lean();

    // Function to convert "DD-MM-YY" to a JavaScript Date object
    function parseCustomDate(dateStr) {
      const [day, month, year] = dateStr.split('-');
      return new Date(`20${year}-${month}-${day}`); // Assuming all dates are 20XX
    }

    // Convert input dates to Date objects for comparison
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    // Filter reservations based on the date range
    const filteredReservations = reservations.filter(res => {
      const reservationDate = parseCustomDate(res.reservationDate);

      if (fromDate && reservationDate < fromDate) return false;
      if (toDate && reservationDate > toDate) return false;
      return true;
    });

    // Further filter by status if needed
    const now = new Date();
    const finalReservations =
      status === 'all'
        ? filteredReservations
        : filteredReservations.filter(res => {
            const resDate = parseCustomDate(res.reservationDate);
            switch (status) {
              case 'upcoming':
                return resDate > now;
              case 'past':
                return resDate < now;
              case 'ongoing':
                return resDate.toDateString() === now.toDateString();
              default:
                return true;
            }
          });

    await logger(user._id, ACTION, 'Reservations Fetched Successfully', 200);
    return NextResponse.json(
      { reservations: finalReservations },
      { status: 200 }
    );
  } catch (error) {
    await logger(user._id, ACTION, 'Fetch Failed: ' + error.message, 500);
    return NextResponse.json(
      { message: 'An error occurred while fetching reservations' },
      { status: 500 }
    );
  }
}
