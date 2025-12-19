import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Society from '@/models/society';
import { authenticate } from '@/lib/authenticate';
import { logger } from '@/lib/logger';

// GET all societies
export async function GET(req) {
    const ACTION = 'Get Societies';

    try {
        await connectMongoDB();
    } catch (error) {
        await logger('SYSTEM', ACTION, 'Database Connection Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'Database connection failed' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const activeOnly = searchParams.get('active') !== 'false';

        const query = {};
        if (type) query.type = type;
        if (activeOnly) query.isActive = true;

        const societies = await Society.find(query).sort({ type: 1, name: 1 });

        await logger('SYSTEM', ACTION, 'Societies Fetched Successfully', 200);
        return NextResponse.json({ societies }, { status: 200 });
    } catch (error) {
        await logger('SYSTEM', ACTION, 'Societies Fetch Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while fetching societies.' }, { status: 500 });
    }
}

// POST create new society
export async function POST(req) {
    const ACTION = 'Add Society';
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
        const society = await Society.create(data);

        await logger(user._id, ACTION, `Society Created Successfully - ID: ${society._id}`, 201);
        return NextResponse.json({ message: 'Society Created', society }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            await logger(user._id, ACTION, 'Society Creation Failed: Duplicate code', 400);
            return NextResponse.json({ message: 'A society with this code already exists.' }, { status: 400 });
        }
        await logger(user._id, ACTION, 'Society Creation Failed: ' + error.message, 500);
        return NextResponse.json({ message: 'An error occurred while creating society.' }, { status: 500 });
    }
}
