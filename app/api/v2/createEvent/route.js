// API route for creating a new event
import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { sendMail } from '@/lib/mail';
import Events from '@/models/events';
import User from '@/models/user';
import Reservation from '@/models/reservation';
import { authenticate } from '@/lib/authenticate';
import Joi from 'joi';
import { logger } from '@/lib/logger';

const schema = Joi.object({
  dept: Joi.string().required().messages({
    'any.required': 'Department is required',
    'string.empty': 'Department cannot be an empty string',
  }),
  userType: Joi.string().required().messages({
    'any.required': 'User type is required',
    'string.empty': 'User type cannot be an empty string',
  }),
  eventData: Joi.object({
    Budget: Joi.number().allow('').messages({
      'number.base': 'Budget must be a number',
    }),
    eventSponsors: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().allow('').messages({
            'string.empty': 'Sponsor name cannot be an empty string',
          }),
          address: Joi.string().allow('').messages({
            'string.empty': 'Sponsor address cannot be an empty string',
          }),
        })
      )
      .messages({
        'array.base': 'Event sponsors must be an array',
      }),
    eventCoordinators: Joi.array()
      .items(
        Joi.object({
          coordinatorName: Joi.string().required().messages({
            'any.required': 'Coordinator name is required',
            'string.empty': 'Coordinator name cannot be an empty string',
          }),
          coordinatorMail: Joi.string().email().required().messages({
            'any.required': 'Coordinator email is required',
            'string.empty': 'Coordinator email cannot be an empty string',
            'string.email': 'Coordinator email must be a valid email',
          }),
          coordinatorPhone: Joi.number().required().messages({
            'any.required': 'Coordinator phone is required',
            'number.base': 'Coordinator phone must be a number',
          }),
          coordinatorRole: Joi.string().required().messages({
            'any.required': 'Coordinator role is required',
            'string.empty': 'Coordinator role cannot be an empty string',
          }),
        })
      )
      .required()
      .messages({
        'any.required': 'Event coordinators are required',
        'array.base': 'Event coordinators must be an array',
      }),
    eventResourcePerson: Joi.array()
      .items(
        Joi.object({
          ResourcePersonName: Joi.string().allow('').messages({
            'string.empty': 'Resource person name cannot be an empty string',
          }),
          ResourcePersonMail: Joi.string().email().allow('').messages({
            'string.empty': 'Resource person email cannot be an empty string',
            'string.email': 'Resource person email must be a valid email',
          }),
          ResourcePersonPhone: Joi.string().allow('').messages({
            'string.empty': 'Resource person phone cannot be an empty string',
          }),
          ResourcePersonDesgn: Joi.string().allow('').messages({
            'string.empty':
              'Resource person designation cannot be an empty string',
          }),
          ResourcePersonAddr: Joi.string().allow('').messages({
            'string.empty': 'Resource person address cannot be an empty string',
          }),
        })
      )
      .required()
      .messages({
        'any.required': 'Event resource persons are required',
        'array.base': 'Event resource persons must be an array',
      }),
    venueList: Joi.array()
      .required()
      .items(
        Joi.object({
          userId: Joi.string().required().messages({
            'any.required': 'Booker ID is required',
            'string.empty': 'Booker ID cannot be an empty string',
            'string.base': 'Booker ID must be a string',
          }),
          venueId: Joi.string().required().messages({
            'any.required': 'Venue ID is required',
            'string.empty': 'Venue ID cannot be an empty string',
          }),
          venueName: Joi.string().required().messages({
            'any.required': 'Venue Name is required',
            'string.empty': 'Venue Name cannot be an empty string',
          }),
          reservationDate: Joi.string().required().messages({
            'any.required': 'Reservation date is required',
            'string.empty': 'Reservation date cannot be an empty string',
          }),
          reservationSession: Joi.string().required().messages({
            'any.required': 'Reservation session is required',
            'string.empty': 'Reservation session cannot be an empty string',
          }),
        })
      ),
    EventName: Joi.string().required().messages({
      'any.required': 'Event name is required',
      'string.empty': 'Event name cannot be an empty string',
    }),
    eventVenueAddInfo: Joi.string().optional().allow(''),
    EventObjective: Joi.string().required().messages({
      'any.required': 'Event objective is required',
      'string.empty': 'Event objective cannot be an empty string',
    }),
    EventParticipants: Joi.number().required().messages({
      'any.required': 'Event participants is required',
      'number.base': 'Event participants must be a number',
    }),
    EventVenue: Joi.string().required().messages({
      'any.required': 'Event venue is required',
      'string.empty': 'Event venue cannot be an empty string',
    }),
    StartTime: Joi.string().required().messages({
      'any.required': 'Start time is required',
      'string.empty': 'Start time cannot be an empty string',
    }),
    EndTime: Joi.string().required().messages({
      'any.required': 'End time is required',
      'string.empty': 'End time cannot be an empty string',
    }),
    EventDuration: Joi.string().required().messages({
      'any.required': 'Event duration is required',
      'string.empty': 'Event duration cannot be an empty string',
    }),
    EventOrganizer: Joi.number().required().messages({
      'any.required': 'Event organizer is required',
      'number.base': 'Event organizer must be a number',
    }),
    isResourcePerson: Joi.boolean().allow(null).messages({
      'boolean.base': 'Is resource person must be a boolean',
    }),
    EventType: Joi.object({
      eventType: Joi.string().required().messages({
        'any.required': 'Event type is required',
        'string.empty': 'Event type cannot be an empty string',
      }),
      eventTypeOtherOption: Joi.string().allow('').messages({
        'string.empty': 'Event type other option cannot be an empty string',
      }),
    })
      .required()
      .messages({
        'any.required': 'Event type is required',
        'object.base': 'Event type must be an object',
      }),
    isSponsored: Joi.string().required().messages({
      'any.required': 'Is sponsored is required',
      'string.empty': 'Is sponsored cannot be an empty string',
    }),
    eventLocation: Joi.string().required().messages({
      'any.required': 'Event location is required',
      'string.empty': 'Event location cannot be an empty string',
    }),
    eventStakeholders: Joi.array().items(Joi.string()).required().messages({
      'any.required': 'Event stakeholders are required',
      'array.base': 'Event stakeholders must be an array',
    }),
    fileUrl: Joi.object({
      poster: Joi.string().required().messages({
        'any.required': 'Poster is required',
        'string.empty': 'Poster cannot be an empty string',
      }),
      sanctionLetter: Joi.string().allow('').messages({
        'string.empty': 'Sanction letter cannot be an empty string',
      }),
    })
      .required()
      .messages({
        'any.required': 'File URL is required',
        'object.base': 'File URL must be an object',
      }),
  })
    .required()
    .messages({
      'any.required': 'Event data is required',
      'object.base': 'Event data must be an object',
    }),
  college: Joi.string().required().messages({
    'any.required': 'College is required',
    'string.empty': 'College cannot be an empty string',
  }),
});

export async function POST(req) {
  let user;
  try {
    user = await authenticate(req);
  } catch (error) {
    logger('Not Auth', 'Create Event', error, 401);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  let valueToJson = await req.json();

  const user_id = user._id.toString();
  const { userType, dept, college } = user;
  const { eventData, fileUrl } = valueToJson;

  if (valueToJson.eventData?.venueList) {
    valueToJson.eventData.venueList = valueToJson.eventData.venueList.map(
      venue => ({
        ...venue,
        userId: user_id,
      })
    );
  }

  // Validate request body
  try {
    const { error } = schema.validate(valueToJson);
    if (error) {
      throw new Error(`Invalid data: ${error.details[0].message}`);
    }
  } catch (error) {
    logger(user._id, 'Create Event', error, 400);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // Ensure database connection
  await connectMongoDB();

  // Check if user has any completed events (status = 2) with missing postEventData
  const pendingPostEventUpdates = await Events.find({
    user_id: user_id,
    status: 2,
    postEventData: null,
    'eventData.EndTime': { $lt: new Date().toISOString() },
  }).select({ 'eventData.EventName': 1, _id: 1 });

  if (pendingPostEventUpdates.length > 0) {
    // Check if user has an admin-granted override
    const overrideResult = await User.updateOne(
      { _id: user_id, postEventOverrideCount: { $gt: 0 } },
      { $inc: { postEventOverrideCount: -1 } }
    );

    if (overrideResult.modifiedCount > 0) {
      logger(
        user_id,
        'Create Event',
        `Override consumed: User had pending post-event data but used an admin-granted override`,
        200
      );
    } else {
      const pendingEventNames = pendingPostEventUpdates.map(
        event => event.eventData?.EventName || 'Unknown Event'
      );
      logger(
        user_id,
        'Create Event',
        `Blocked: User has ${pendingPostEventUpdates.length} events pending post-event annexure upload`,
        403
      );
      return NextResponse.json(
        {
          message: `You cannot create a new event until you upload annexures for your previous completed event(s): ${pendingEventNames.join(', ')}`,
          pendingEvents: pendingPostEventUpdates.map(e => ({
            id: e._id,
            name: e.eventData?.EventName,
          })),
        },
        { status: 403 }
      );
    }
  }

  const crtuser = await User.findOne({ _id: user_id });
  const StartTime = new Date(eventData.StartTime);
  const EndTime = new Date(eventData.EndTime);
  let userStatus,
    user_ins_id = null,
    user_iqac_id = null;

  // Determine the correct dept:
  // - For Department (1) and AICTE Idea Lab (5): use user's dept from session
  // - For Professional Societies (2), Clubs (3), and Other (4): use dept from request payload
  let user_dept = dept; // Default to user's dept from session
  if (
    eventData.EventOrganizer == 2 ||
    eventData.EventOrganizer == 3 ||
    eventData.EventOrganizer == 4
  ) {
    user_dept = valueToJson.dept; // Use the dept from the request payload (e.g., "Entrepreneurship Cell")
  }

  let eventCollege =
    eventData.EventOrganizer === 1 || eventData.EventOrganizer === 5
      ? college
      : 'common';
  if (userType === 'HOD') {
    if (user.dept === dept) {
      userStatus = 1;
    } else {
      userStatus = 1; //Added by Rashim on 3rd Apr 25 to bypass the HOD check
    }
  } else if (userType === 'admin') {
    userStatus = 2;
    user_ins_id = Array.from({ length: 14 }, () =>
      Math.random() > 0.5
        ? String.fromCharCode(Math.floor(Math.random() * 10) + 48)
        : String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join('');
    user_iqac_id = user_id;
  } else {
    if (eventData.EventOrganizer == 4) {
      userStatus = 1;
    } else {
      userStatus = 1; //Added by Rashim on 3rd Apr 25 to bypass the Club check
    }
  }

  try {
    //Insert into reservations collection
    const modifiedVenueList = eventData.venueList.map(venue => ({
      ...venue,
      userId: user_id,
    }));

    const createdReservations = await Reservation.insertMany(modifiedVenueList);
    const reservationIds = createdReservations.map(item => item._id.toString());
    eventData.venueList = reservationIds;

    // Insert the event into the collection
    const createdEvent = await Events.create({
      user_id,
      eventCollege,
      dept: user_dept,
      status: userStatus,
      ins_id: user_ins_id,
      iqac_id: user_iqac_id,
      eventData,
      StartTime,
      EndTime,
      fileUrl,
    });

    if (userType === 'staff') {
      const rcvuser = await User.findOne({
        userType: 'HOD',
        dept: user_dept,
        college: eventCollege,
      });

      const rcvmail = rcvuser ? rcvuser.email : null;
      sendMail(
        rcvmail,
        'create',
        crtuser.name,
        eventData.EventName,
        createdEvent._id
      );
    } else if (userType === 'HOD') {
      // Send notification only to IQAC for level 2 processing
      sendMail(
        'iqacsec@sairam.edu.in',
        'create',
        crtuser.name,
        eventData.EventName,
        createdEvent._id
      );
    }
    logger(user._id, 'Create Event', 'Event Created', 201);
    return NextResponse.json({ message: 'Event Created.' }, { status: 201 });
  } catch (error) {
    logger(user._id, 'Create Event', error, 500);
    console.error('Error inserting event:', error);
    return NextResponse.json(
      { message: 'An error occurred while Creating Event.' },
      { status: 500 }
    );
  }
}
