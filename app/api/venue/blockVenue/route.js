import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Reservation from '@/models/reservation';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';
import Venue from '@/models/venue';
import { eachDayOfInterval, format, parseISO } from 'date-fns';

export async function POST(req) {
  const ACTION = 'Block Venue Manual';
  let user;

  // 1. Authentication
  try {
    user = await authenticate(req);
    // Check if user is admin
    if (user.userType !== 'admin') {
      await logger(
        user?._id || 'UNKNOWN',
        ACTION,
        'Unauthorized Access Attempt',
        403
      );
      return NextResponse.json(
        { message: 'Unauthorized. Only admins can block venues.' },
        { status: 403 }
      );
    }
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

  // 2. Database Connection
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

  // 3. Process Request
  try {
    const { venueId, startDate, endDate, sessions, reason } = await req.json();

    if (
      !venueId ||
      !startDate ||
      !endDate ||
      !sessions ||
      sessions.length === 0
    ) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get venue details for name
    const venue = await Venue.findOne({ venueId: venueId });
    if (!venue) {
      return NextResponse.json({ message: 'Venue not found' }, { status: 404 });
    }
    const venueName = venue.venueName;

    // Generate all requested slots
    const requestedSlots = [];
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const dates = eachDayOfInterval({ start, end });

    for (const date of dates) {
      const formattedDate = format(date, 'dd-MM-yy');
      for (const session of sessions) {
        requestedSlots.push({
          venueId,
          reservationDate: formattedDate,
          reservationSession: session,
        });
      }
    }

    if (requestedSlots.length === 0) {
      return NextResponse.json(
        { message: 'No valid slots generated.' },
        { status: 400 }
      );
    }

    // Check for existing reservations in bulk
    const existingReservations = await Reservation.find({
      venueId,
      $or: requestedSlots.map(slot => ({
        reservationDate: slot.reservationDate,
        reservationSession: slot.reservationSession,
      })),
    });

    // Create a set of existing identifiers for quick lookup
    const existingSet = new Set(
      existingReservations.map(
        res => `${res.reservationDate}-${res.reservationSession}`
      )
    );

    // Filter out slots that are already reserved
    const newReservations = requestedSlots
      .filter(
        slot =>
          !existingSet.has(`${slot.reservationDate}-${slot.reservationSession}`)
      )
      .map(slot => ({
        ...slot,
        venueName,
        userId: user._id.toString(),
        reason: reason || 'Manual Block',
      }));

    if (newReservations.length === 0) {
      return NextResponse.json(
        { message: 'All selected slots are already reserved.' },
        { status: 409 }
      );
    }

    // Bulk Insert
    await Reservation.insertMany(newReservations);

    const blockedCount = newReservations.length;
    const skippedCount = requestedSlots.length - blockedCount;

    await logger(
      user._id,
      ACTION,
      `Blocked ${venueName} for ${blockedCount} slots. Skipped ${skippedCount}.`,
      200
    );

    let message = `Successfully blocked ${blockedCount} slots.`;
    if (skippedCount > 0) {
      message += ` ${skippedCount} slots were already reserved.`;
    }

    return NextResponse.json({ message }, { status: 200 });
  } catch (error) {
    await logger(user._id, ACTION, 'Block Failed: ' + error.message, 500);
    return NextResponse.json(
      {
        message: 'An error occurred while blocking the venue: ' + error.message,
      },
      { status: 500 }
    );
  }
}
