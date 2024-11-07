import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import Reservation from "@/models/reservation";
import Venue from "@/models/venue"; // Assuming you have a Venue model
import { logger } from "@/lib/logger";
import { authenticate } from "@/lib/authenticate";

// API route for editing an event
export async function POST(req) {
    let user;
    try {
        user = await authenticate(req);
    } catch (error) {
        logger("Not Auth", "Update Event", error, 401);
        return NextResponse.json({ message: error.message }, { status: 401 });
    }

    // Ensure database connection
    await connectMongoDB();

    // Event data and user_id from the request
    let valueToJson = await req.json();
    console.log(valueToJson);

    const { _id, user_id, userType, dept, eventData, status, college, venueList } = valueToJson;
    const StartTime = new Date(eventData.StartTime);
    const EndTime = new Date(eventData.EndTime);
    let userStatus = null;

    if (eventData.EventOrganizer == 4 && userType === 'admin') {
        userStatus = 2;
    } else if (eventData.EventOrganizer == 4) {
        userStatus = 1;
    } else {
        userStatus = (status == 3) ? 0 : ((status == 4) ? 1 : 0);
    }

    try {
        // Fetch old reservations
        const oldEvent = await Events.findById(_id).populate('eventData.venueList');
        if (!oldEvent) {
            logger(user._id, "Update Event", "Event Not Found", 404);
            return NextResponse.json({ message: "Event not found." }, { status: 404 });
        }

        // Delete old reservations
        if (oldEvent.eventData.venueList && oldEvent.eventData.venueList.length) {
            await Reservation.deleteMany({ _id: { $in: oldEvent.eventData.venueList } });
        }

        // Check if venueList is defined
        if (!eventData.venueList || !Array.isArray(eventData.venueList)) {
            throw new Error("Invalid or missing venueList.");
        }

        // Fetch venue names from venueList
        const venueIds = eventData.venueList.map(v => v.venueId);
        const venues = await Venue.find({ venueId: { $in: venueIds } });
        const venueMap = venues.reduce((map, venue) => {
            map[venue.venueId] = venue.venueName;
            return map;
        }, {});

        // Add venueName to new reservations
        const reservationsWithNames = eventData.venueList.map(v => ({
            ...v,
            venueName: venueMap[v.venueId] // Add venueName fetched from the venues collection
        }));

        // Insert new reservations
        const createdReservations = await Reservation.insertMany(reservationsWithNames);
        const reservationIds = createdReservations.map(item => item._id.toString());

        // Update event with new reservations
        const updatedEvent = await Events.findByIdAndUpdate(
            _id,
            {
                dept,
                eventCollege: college,
                status: userStatus,
                eventData: {
                    ...eventData,
                    venueList: reservationIds
                },
                StartTime,
                EndTime,
            },
            { new: true }
        );

        if (updatedEvent) {
            logger(user._id, "Update Event", "Event Updated", 200);
            return NextResponse.json({ message: "Event Updated." }, { status: 200 });
        } else {
            logger(user._id, "Update Event", "Event Not Found", 404);
            return NextResponse.json({ message: "Event not found." }, { status: 404 });
        }
    } catch (error) {
        logger(user._id, "Update Event", error, 500);
        console.error('Error updating event:', error);
        return NextResponse.json(
            { message: "An error occurred while updating the event." },
            { status: 500 }
        );
    }
}
