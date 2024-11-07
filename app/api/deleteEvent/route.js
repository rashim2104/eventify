import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Events from "@/models/events";
import { authenticate } from '@/lib/authenticate';
import {logger} from "@/lib/logger";

// API route for deleting an event

export async function POST(req) {
    const user = await authenticate(req);
    // Ensure database connection
    await connectMongoDB();

    // Event _id from the request
    let valueToJson = await req.json();

    const { _id } = valueToJson;
    const eventData = await Events.findOne({ _id });
    if(!eventData){
        logger(user._id,"Delete Event","Event Not found",404);
        return NextResponse.json({ message: "Event not found." }, { status: 404 });
    }
    if(!eventData.user_id.equals(user._id)){
        logger(user._id,"Delete Event","Not Authorized",401)
        return NextResponse.json({ message: "You are not authorized to delete this event." }, { status: 401 });
    }

    try {
        // Find the existing event by _id and delete it
        const deletedEvent = await Events.findOneAndDelete({ _id });

        if (deletedEvent) {
            logger(user._id,"Delete Event","Event Deleted",200)
            return NextResponse.json({ message: "Event Deleted." }, { status: 200 });
        } else {
            logger(user._id,"Delete Event","Event Not found",404)
            return NextResponse.json({ message: "Event not found." }, { status: 404 });
        }
    } catch (error) {
        logger(user._id,"Delete Event",error,500)
        console.error('Error deleting event:', error);
        return NextResponse.json(
            { message: "An error occurred while deleting the event." },
            { status: 500 }
        ); 
    }
}