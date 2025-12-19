import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import College from '@/models/college';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// GET all colleges
export async function GET(req) {
    const ACTION = 'Get Colleges';

    try {
        await connectMongoDB();
    } catch (error) {
        await logger('SYSTEM', ACTION, 'Database Connection Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const activeOnly = searchParams.get('active') !== 'false';

        const query = activeOnly ? { isActive: true } : {};
        const colleges = await College.find(query).sort({ code: 1 });

        await logger('SYSTEM', ACTION, 'Colleges Fetched Successfully', 200);
        return NextResponse.json({ colleges }, { status: 200 });
    } catch (error) {
        await logger('SYSTEM', ACTION, 'Colleges Fetch Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while fetching colleges.' }, { status: 500 });
    }
}

// POST create new college
export async function POST(req) {
    const ACTION = 'Add College';
    let user;

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
        const college = await College.create(data);

        await logger(user._id, ACTION, `College Created Successfully - ID: ${college._id}`, 201);
        return NextResponse.json({ message: 'College Created', college }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            await logger(user._id, ACTION, 'College Creation Failed: Duplicate code', 400);
            return NextResponse.json({ message: 'A college with this code already exists.' }, { status: 400 });
        }
        await logger(user._id, ACTION, 'College Creation Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while creating college.' }, { status: 500 });
    }
}
