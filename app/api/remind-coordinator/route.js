import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import User from '@/models/user';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';
import { sendMail } from '@/lib/mail';

export async function POST(req) {
  const ACTION = 'Remind Coordinator';
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
    if (!eventId) {
      return NextResponse.json(
        { message: 'eventId is required' },
        { status: 400 }
      );
    }

    const event = await Events.findById(eventId);
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Only admins can send reminders
    if (user.userType !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    // Consider event completed if EndTime < now
    const completed = (() => {
      const end = event?.eventData?.EndTime
        ? new Date(event.eventData.EndTime)
        : null;
      return end && end < new Date();
    })();
    const postEventFilled = Boolean(event?.postEventData);

    if (!completed || postEventFilled) {
      return NextResponse.json(
        { message: 'Reminder not applicable for this event' },
        { status: 400 }
      );
    }

    // Fetch creator via user_id
    const creator = await User.findById(event.user_id);
    const recipientEmail = creator?.email;
    const recipientName = creator?.name || 'User';

    if (!recipientEmail) {
      return NextResponse.json(
        { message: 'Creator email not available' },
        { status: 400 }
      );
    }

    // Send reminder email to creator
    await sendMail(
      recipientEmail,
      'reminder',
      user?.name || 'Admin',
      event?.eventData?.EventName || 'Event',
      event?._id?.toString(),
      'Please submit post-event details at the earliest.'
    );

    await logger(
      user._id,
      ACTION,
      `Reminder sent to ${recipientEmail} for event ${event._id}`,
      200
    );
    return NextResponse.json(
      { message: 'Reminder email sent' },
      { status: 200 }
    );
  } catch (error) {
    await logger(user._id, ACTION, 'Reminder Failed: ' + error.message, 500);
    return NextResponse.json(
      { message: 'Failed to send reminder' },
      { status: 500 }
    );
  }
}
