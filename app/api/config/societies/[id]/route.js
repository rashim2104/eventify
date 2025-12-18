import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Society from '@/models/society';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// PUT update society
export async function PUT(req, { params }) {
    const ACTION = 'Update Society';
    let user;
    const { id } = params;

    try {
        user = await authenticate(req);
    } catch (error) {
        await logger('UNKNOWN', ACTION, 'Authentication Failed: ' + error.message, 401);
        return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    }

    if (user.userType !== 'admin') {
        await logger(user._id, ACTION, 'Authorization Failed: Not Admin', 403);
        return NextResponse.json({ message: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    try {
        await connectMongoDB();
    } catch (error) {
        await logger(user._id, ACTION, 'Database Connection Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    try {
        const data = await req.json();
        const society = await Society.findByIdAndUpdate(id, data, { new: true });

        if (!society) {
            await logger(user._id, ACTION, `Society Not Found - ID: ${id}`, 404);
            return NextResponse.json({ message: 'Society not found' }, { status: 404 });
        }

        await logger(user._id, ACTION, `Society Updated Successfully - ID: ${id}`, 200);
        return NextResponse.json({ message: 'Society Updated', society }, { status: 200 });
    } catch (error) {
        await logger(user._id, ACTION, 'Society Update Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while updating society.' }, { status: 500 });
    }
}

// DELETE society
export async function DELETE(req, { params }) {
    const ACTION = 'Delete Society';
    let user;
    const { id } = params;

    try {
        user = await authenticate(req);
    } catch (error) {
        await logger('UNKNOWN', ACTION, 'Authentication Failed: ' + error.message, 401);
        return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    }

    if (user.userType !== 'admin') {
        await logger(user._id, ACTION, 'Authorization Failed: Not Admin', 403);
        return NextResponse.json({ message: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    try {
        await connectMongoDB();
    } catch (error) {
        await logger(user._id, ACTION, 'Database Connection Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    try {
        const society = await Society.findByIdAndDelete(id);

        if (!society) {
            await logger(user._id, ACTION, `Society Not Found - ID: ${id}`, 404);
            return NextResponse.json({ message: 'Society not found' }, { status: 404 });
        }

        await logger(user._id, ACTION, `Society Deleted Successfully - ID: ${id}`, 200);
        return NextResponse.json({ message: 'Society Deleted' }, { status: 200 });
    } catch (error) {
        await logger(user._id, ACTION, 'Society Deletion Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while deleting society.' }, { status: 500 });
    }
}
