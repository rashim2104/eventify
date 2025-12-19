import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import College from '@/models/college';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// PUT update college
export async function PUT(req, { params }) {
    const ACTION = 'Update College';
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
        const college = await College.findByIdAndUpdate(id, data, { new: true });

        if (!college) {
            await logger(user._id, ACTION, `College Not Found - ID: ${id}`, 404);
            return NextResponse.json({ message: 'College not found' }, { status: 404 });
        }

        await logger(user._id, ACTION, `College Updated Successfully - ID: ${id}`, 200);
        return NextResponse.json({ message: 'College Updated', college }, { status: 200 });
    } catch (error) {
        await logger(user._id, ACTION, 'College Update Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while updating college.' }, { status: 500 });
    }
}

// DELETE college
export async function DELETE(req, { params }) {
    const ACTION = 'Delete College';
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
        const college = await College.findByIdAndDelete(id);

        if (!college) {
            await logger(user._id, ACTION, `College Not Found - ID: ${id}`, 404);
            return NextResponse.json({ message: 'College not found' }, { status: 404 });
        }

        await logger(user._id, ACTION, `College Deleted Successfully - ID: ${id}`, 200);
        return NextResponse.json({ message: 'College Deleted' }, { status: 200 });
    } catch (error) {
        await logger(user._id, ACTION, 'College Deletion Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while deleting college.' }, { status: 500 });
    }
}
