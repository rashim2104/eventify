import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Events from '@/models/events';
import User from '@/models/user';
import { sendMail } from '@/lib/mail';
import { authenticate } from '@/lib/authenticate';
import { IdGen } from '@/lib/eventIdGen';
import { logger } from '@/lib/logger';

export async function POST(req) {
  const ACTION = 'Event Approval';
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

  const { _id: user_id, userType, email } = user;

  if (userType !== 'admin' && userType !== 'HOD') {
    await logger(
      user_id,
      ACTION,
      'Authorization Failed: Invalid user type',
      403
    );
    return NextResponse.json(
      { message: 'You are not authorized to perform this action.' },
      { status: 403 }
    );
  }

  try {
    await connectMongoDB();
  } catch (error) {
    await logger(
      user_id,
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
    const { event_id, action, comment, customEventId } = await req.json();
    const eventDetails = await Events.findOne({ _id: event_id });

    if (!eventDetails) {
      await logger(user_id, ACTION, `Event Not Found: ${event_id}`, 404);
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Get coordinator email from event document
    const coordinatorEmail =
      eventDetails.eventData.eventCoordinators[0].coordinatorMail;
    let userEvents;

    if (
      email === 'principal@sairam.edu.in' ||
      email === 'principal@sairamit.edu.in'
    ) {
      if (action === 'Approve') {
        const eventId = await IdGen(
          eventDetails.user_id,
          eventDetails.dept,
          eventDetails.eventCollege
        );
        userEvents = await Events.updateOne(
          { _id: event_id },
          { $set: { status: 2, ins_id: eventId } }
        );

        sendMail(
          coordinatorEmail,
          'approve',
          user.name,
          eventDetails.eventData.EventName,
          event_id
        );
      }
    } else if (userType === 'admin') {
      switch (action) {
        case 'Approve':
          const eventId =
            customEventId ||
            (await IdGen(
              eventDetails.user_id,
              eventDetails.dept,
              eventDetails.eventCollege
            ));
          userEvents = await Events.updateOne(
            { _id: event_id },
            {
              $set: {
                status: 2,
                iqac_id: user_id,
                ins_id: customEventId,
              },
            }
          );
          sendMail(
            coordinatorEmail,
            'approve',
            user.name,
            eventDetails.eventData.EventName,
            event_id
          );
          break;
        case 'Reject':
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: -2, iqac_id: user_id } }
          );
          sendMail(
            coordinatorEmail,
            'reject',
            user.name,
            eventDetails.eventData.EventName,
            event_id
          );
          break;
        case 'Comment':
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 4, iqac_id: user_id, comment: comment } }
          );
          sendMail(
            coordinatorEmail,
            'comment',
            user.name,
            eventDetails.eventData.EventName,
            event_id,
            comment
          );
          break;
        case 'ApprovePrinc':
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 5, iqac_id: user_id } }
          );
          break;
      }
    } else if (userType === 'HOD') {
      switch (action) {
        case 'Approve':
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 1 } }
          );
          sendMail(
            coordinatorEmail,
            'approve',
            user.name,
            eventDetails.eventData.EventName,
            event_id
          );
          break;
        case 'Reject':
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: -1 } }
          );
          sendMail(
            coordinatorEmail,
            'reject',
            user.name,
            eventDetails.eventData.EventName,
            event_id
          );
          break;
        case 'Comment':
          userEvents = await Events.updateOne(
            { _id: event_id },
            { $set: { status: 3, comment: comment } }
          );
          sendMail(
            coordinatorEmail,
            'comment',
            user.name,
            eventDetails.eventData.EventName,
            event_id,
            comment
          );
          break;
      }
    }

    await logger(
      user_id,
      ACTION,
      `Event ${action} Successful: ${event_id}`,
      200
    );
    return NextResponse.json({ message: userEvents }, { status: 200 });
  } catch (error) {
    await logger(user_id, ACTION, `Event Update Failed: ${error.message}`, 500);
    return NextResponse.json(
      { message: 'An error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
