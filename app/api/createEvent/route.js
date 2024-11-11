// API route for creating a new event
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { sendMail } from "@/lib/mail";
import Events from "@/models/events";
import User from "@/models/user";
import Reservation from "@/models/reservation";
import { authenticate } from "@/lib/authenticate";
import Joi from "joi";
import { logger } from "@/lib/logger";

const schema = Joi.object({
  user_id: Joi.string().required().messages({
    'any.required': 'User ID is required',
    'string.empty': 'User ID cannot be an empty string',
    'string.base': 'User ID must be a string',
  }),
  dept: Joi.string().required().messages({
    'any.required': 'Department is required',
    'string.empty': 'Department cannot be an empty string',
  }),
  userType: Joi.string().required().messages({
    'any.required': 'User type is required',
    'string.empty': 'User type cannot be an empty string',
  }),
  eventData: Joi.object({
    Budget: Joi.number().allow("").messages({
      'number.base': 'Budget must be a number',
    }),
    eventSponsors: Joi.array().items(
      Joi.object({
        name: Joi.string().allow("").messages({
          'string.empty': 'Sponsor name cannot be an empty string',
        }),
        address: Joi.string().allow("").messages({
          'string.empty': 'Sponsor address cannot be an empty string',
        }),
      })
    ).messages({
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
            'string.empty': 'Resource person designation cannot be an empty string',
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
    venueList: Joi.array().required()
      .items(
        Joi.object({
          userId: Joi.string().required().messages({
            'any.required': 'Booker ID is required',
            'string.empty': 'Booker ID cannot be an empty string',
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
      eventTypeOtherOption: Joi.string().allow("").messages({
        'string.empty': 'Event type other option cannot be an empty string',
      }),
    }).required().messages({
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
      sanctionLetter: Joi.string().allow("").messages({
        'string.empty': 'Sanction letter cannot be an empty string',
      }),
    }).required().messages({
      'any.required': 'File URL is required',
      'object.base': 'File URL must be an object',
    }),
  }).required().messages({
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
    // Continue with your logic here
  } catch (error) {
    logger("Not Auth", "Create Event", error, 401);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

  // Event data and user_id from the request
  // console.log(req.body)

  let valueToJson = await req.json();

  // Validate the request body
  try {
    const { error } = schema.validate(valueToJson);
    if (error) {
      throw new Error(`Invalid data: ${error.details[0].message}`);
    }
    // Continue with your logic here
  } catch (error) {
    logger(user._id, "Create Event", error, 400)
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  // Ensure database connection
  await connectMongoDB();

  const { user_id, userType, dept, eventData, college, fileUrl } = valueToJson;
  const crtuser = await User.findOne({ _id: user_id });
  const StartTime = new Date(eventData.StartTime);
  const EndTime = new Date(eventData.EndTime);
  let userStatus,
    user_ins_id = null,
    user_iqac_id = null,
    user_dept = dept;
  console.log(eventData.eventOrganizer);
  let eventCollege =
    eventData.EventOrganizer === 1 ||
      eventData.EventOrganizer === 1 ||
      eventData.EventOrganizer === 1
      ? college
      : "common";
  if (userType === "HOD") {
    if (user.dept === dept) {
      userStatus = 1;
    } else {
      userStatus = 0;
    }
  } else if (userType === "admin") {
    //disabled event creation for admin
    userStatus = 2;
    user_ins_id = Array.from({ length: 14 }, () =>
      Math.random() > 0.5
        ? String.fromCharCode(Math.floor(Math.random() * 10) + 48)
        : String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join("");
    user_iqac_id = user_id;
  } else {
    if (eventData.EventOrganizer == 4) {
      userStatus = 1;
    } else {
      userStatus = 0;
    }
  }
  try {
    //Insert into reservations collection
    const createdReservations = await Reservation.insertMany(eventData.venueList);
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
      fileUrl, // Directly insert the JSON object
    });

    //     if (userType === "staff") {
    //       const rcvuser = await User.findOne({
    //         userType: "HOD",
    //         dept: user_dept,
    //         college: eventCollege,
    //       });

    //       const rcvmail = rcvuser ? rcvuser.email : null;
    //       sendMail(
    //   "rashimrb22@gmail.com",
    //   "create",
    //   crtuser.name,
    //   eventData.EventName,
    //   createdEvent._id
    // );
    //     } else if (userType === "HOD") {
    //       const rcvusers = await User.find({
    //         userType: "admin",
    //         college: eventCollege,
    //       });
    //       console.log(rcvusers);
    //       const rcvmail = rcvusers ? rcvusers.map((user) => user.email) : [];
    //       console.log(rcvmail);
    //       sendMail(
    //         ["rashimrb22@gmail.com", "www.rashimrb.2004@gmail.com"],
    //         "create",
    //         crtuser.name,
    //         eventData.EventName,
    //         createdEvent._id
    //       );
    //     }
    logger(user._id, "Create Event", "Event Created", 201)
    return NextResponse.json({ message: "Event Created." }, { status: 201 });
  } catch (error) {
    logger(user._id, "Create Event", error, 500)
    console.error("Error inserting event:", error);
    return NextResponse.json(
      { message: "An error occurred while Creating Event." },
      { status: 500 }
    );
  }
}
