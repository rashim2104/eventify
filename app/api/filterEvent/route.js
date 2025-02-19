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

        console.log("Received filter data:", data); // Debug received data

        // Only add date filter if dates are provided
        if (data.startDate && data.endDate) {
            query['eventData.StartTime'] = {
                $gte: data.startDate + "T00:00",
                $lt: data.endDate + "T23:59"
            };
        }

        // Only add filters if they have non-empty values
        if (data.college) {
            query.eventCollege = data.college;
        }

        if (data.eventOrganizer) {
            query['eventData.EventOrganizer'] = data.eventOrganizer;
        }

        if(user.userType === 'HOD') {
            // HOD specific filters
            if (!data.eventStatus?.includes("All")) {
                const actualEventStatus = data.eventStatus?.flatMap(status => statusMapping[status]);
                if (actualEventStatus?.length > 0) {
                    query.status = { $in: actualEventStatus };
                }
            }
            // HOD specific filters
            query.eventCollege = user.college;
            query.dept = user.dept;
        } else if (user.userType === 'admin') {
            // For admin, only add college filter if specifically provided
            if(data.organizer === 'aicte') {
                query['eventData.EventOrganizer'] = "5";
            } else if(data.organizer === 'others') {
                query['eventData.EventOrganizer'] = "4";
            } else if(data.department) {
                query.dept = data.department;
            }
        }

        console.log("Final query:", JSON.stringify(query, null, 2)); // Debug final query

        // Remove select to get full documents for debugging
        const userEvents = await Events.find(query);
        
        console.log("Query result count:", userEvents.length); // Debug results count
        console.log("First event (if exists):", 
            userEvents.length > 0 ? JSON.stringify(userEvents[0], null, 2) : "No events found"
        ); // Debug first result

        if (!userEvents || userEvents.length === 0) {
            await logger(
                user._id,
                ACTION,
                "No events found for query",
                200
            );
            return NextResponse.json(
                { 
                    events: [],
                    debug: {
                        query,
                        message: "No events found matching criteria"
                    }
                },
                { status: 200 }
            );
        }
        
        await logger(
            user._id,
            ACTION,
            `Events Filtered Successfully - Count: ${userEvents.length}`,
            200
        );
        return NextResponse.json(
            { 
                events: userEvents,
                debug: {
                    query,
                    resultCount: userEvents.length
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Filter Error:", error); // Debug errors
        await logger(
            user._id,
            ACTION,
            "Event Filtering Failed: " + error.message,
            500
        );
        return NextResponse.json(
            { 
                message: "An error occurred while filtering events.",
                debug: {
                    error: error.message,
                    stack: error.stack
                }
            },
            { status: 500 }
        );
    }
}
