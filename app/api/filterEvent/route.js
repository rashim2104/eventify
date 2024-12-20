import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { clubsShort, societies, ieeeSocietiesShort } from "@/public/data/data";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Filter Event";
    let user;

    try {
        user = await authenticate(req);
    } catch (error) {
        await logger(
            "UNKNOWN",
            ACTION,
            "Authentication Failed: " + error.message,
            401
        );
        return NextResponse.json(
            { message: "Authentication failed" },
            { status: 401 }
        );
    }

    if (user.userType !== "HOD" && user.userType !== "admin") {
        await logger(
            user._id,
            ACTION,
            "Authorization Failed: Invalid user type",
            403
        );
        return NextResponse.json(
            { message: "You are not authorized to view this page." },
            { status: 403 }
        );
    }

    try {
        await connectMongoDB();
    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Database Connection Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "Database connection failed" },
            { status: 500 }
        );
    }

    try {
        const statusMapping = {
            "Created": [0],
            "Approved": [1,2],
            "Rejected": [-1, -2],
            "Marked for change": [3,4],
        };

        const data = await req.json();
        let query = {};

        if(user.userType === 'HOD') {
            if (!data.eventStatus.includes("All")) {
                const actualEventStatus = data.eventStatus.flatMap(status => statusMapping[status]);
                if (actualEventStatus.length > 0) {
                    query.status = { $in: actualEventStatus };
                }
            }
            query.eventCollege = {$in: user.college};
            query.dept = user.dept;
        } else {
            query.eventCollege = {$in: data.eventCollege};
            if(data.organizer === 'aicte') {
                query['eventData.EventOrganizer'] = "5";
            } else if(data.organizer === 'others') {
                query['eventData.EventOrganizer'] = "4";
            } else {
                query.dept = data.department;
            }
        }

        query['eventData.StartTime'] = {
            $gte: data.startDate + "T00:00",
            $lt: data.endDate + "T23:59"
        };

        const userEvents = await Events.find(query).select({ "eventData.EventName": 1 });
        
        await logger(
            user._id,
            ACTION,
            `Events Filtered Successfully - Count: ${userEvents.length}`,
            200
        );
        return NextResponse.json(
            { events: userEvents },
            { status: 200 }
        );

    } catch (error) {
        await logger(
            user._id,
            ACTION,
            "Event Filtering Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { message: "An error occurred while filtering events." },
            { status: 500 }
        );
    }
}
