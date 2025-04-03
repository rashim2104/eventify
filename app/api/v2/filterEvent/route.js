import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from "@/lib/authenticate";
import { logger } from "@/lib/logger";

export async function POST(req) {
    const ACTION = "Filter Events";
    let user;

    try {
        user = await authenticate(req);
    } catch (error) {
        await logger("UNKNOWN", ACTION, "Authentication Failed: " + error.message, 401);
        return NextResponse.json({ message: "Authentication failed" }, { status: 401 });
    }

    try {
        await connectMongoDB();
    } catch (error) {
        await logger(user._id, ACTION, "Database Connection Failed: " + error.message, 500);
        return NextResponse.json({ message: "Database connection failed" }, { status: 500 });
    }

    try {
        const { startDate, endDate, filters } = await req.json();
        let query = {};

        // Add date range filter if provided
        if (startDate && endDate) {
            // Convert dates to match Compass format
            query['eventData.StartTime'] = {
                $gte: startDate + "T00:00:00.000Z",
                $lt: endDate + "T23:59:59.999Z"
            };
            console.log("Date range query:", JSON.stringify(query['eventData.StartTime']));
        }

        // Handle organizer type and society filters
        if (filters['eventData.EventOrganizer']) {
            query['eventData.EventOrganizer'] = filters['eventData.EventOrganizer'];
        }

        // Add society/department filter if specified
        if (filters.dept) {
            query.dept = filters.dept;
        }

        // Admin specific logic
        if (user.userType === 'admin') {
            // No additional restrictions for admin
        } else if (user.userType === 'HOD') {
            // HOD can only see events from their department and college
            query.dept = user.dept;
            query.eventCollege = user.college;
        } else {
            // Other users can only see their own events
            query.user_id = user._id;
        }

        // Add debug prints
        console.log("Raw request body:", JSON.stringify({ startDate, endDate, filters }));
        console.log("Final query:", JSON.stringify(query, null, 2));

        // First try to count the documents
        const count = await Events.countDocuments(query);
        console.log("Document count before fetch:", count);

        // Check what dates are actually in the database
        const sampleDates = await Events.distinct('eventData.StartTime');
        console.log("Sample dates in DB:", sampleDates.slice(0, 5));

        const events = await Events.find(query)
            .sort({ 'eventData.StartTime': -1 })
            .collation({ locale: "en" });

        await logger(user._id, ACTION, `Events Filtered Successfully - Count: ${events.length}`, 200);
        
        // Return debug info with the response
        return NextResponse.json({ 
            events,
            debug: { 
                query,
                resultCount: events.length,
                sampleDates: sampleDates.slice(0, 5),
                requestDates: {
                    start: startDate + "T00:00:00.000Z",
                    end: endDate + "T23:59:59.999Z"
                }
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Filter error:", error);
        await logger(user._id, ACTION, "Event Filtering Failed: " + error.message, 500);
        return NextResponse.json(
            { message: "An error occurred while filtering events" },
            { status: 500 }
        );
    }
}
