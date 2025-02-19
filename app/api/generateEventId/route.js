import { NextResponse } from "next/server";
import { authenticate } from "@/lib/authenticate";
import { IdGen } from "@/lib/eventIdGen";

export async function POST(req) {
    try {
        const user = await authenticate(req);
        if (user.userType !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, dept, college } = await req.json();
        // Generate the suggested event ID
        const suggestedEventId = await IdGen(userId, dept, college);
        
        return NextResponse.json({ 
            eventId: suggestedEventId,
            message: "This is a suggested ID. You can modify it before approval."
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error generating event ID" },
            { status: 500 }
        );
    }
}
