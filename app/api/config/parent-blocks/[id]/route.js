import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ParentBlock from '@/models/parentBlock';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// PUT update parent block
export async function PUT(req, { params }) {
    const ACTION = 'Update Parent Block';
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
        const parentBlock = await ParentBlock.findByIdAndUpdate(id, data, { new: true });

        if (!parentBlock) {
            await logger(user._id, ACTION, `Parent Block Not Found - ID: ${id}`, 404);
            return NextResponse.json({ message: 'Parent block not found' }, { status: 404 });
        }

        await logger(user._id, ACTION, `Parent Block Updated Successfully - ID: ${id}`, 200);
        return NextResponse.json({ message: 'Parent Block Updated', parentBlock }, { status: 200 });
    } catch (error) {
        await logger(user._id, ACTION, 'Parent Block Update Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while updating parent block.' }, { status: 500 });
    }
}

// DELETE parent block
export async function DELETE(req, { params }) {
    const ACTION = 'Delete Parent Block';
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
        const parentBlock = await ParentBlock.findByIdAndDelete(id);

        if (!parentBlock) {
            await logger(user._id, ACTION, `Parent Block Not Found - ID: ${id}`, 404);
            return NextResponse.json({ message: 'Parent block not found' }, { status: 404 });
        }

        await logger(user._id, ACTION, `Parent Block Deleted Successfully - ID: ${id}`, 200);
        return NextResponse.json({ message: 'Parent Block Deleted' }, { status: 200 });
    } catch (error) {
        await logger(user._id, ACTION, 'Parent Block Deletion Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while deleting parent block.' }, { status: 500 });
    }
}
