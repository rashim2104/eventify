import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/authenticate';
import { IdGen } from '@/lib/eventIdGen';
import Events from '@/models/events';

export async function POST(req) {
  try {
    const user = await authenticate(req);
    if (user.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId, dept, college } = await req.json();

    // Fetch the complete event document
    const event = await Events.findOne({ user_id: userId }).sort({ _id: -1 });
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Generate the suggested event ID using full event document
    const suggestedEventId = await IdGen(event);

    return NextResponse.json(
      {
        eventId: suggestedEventId,
        message: 'This is a suggested ID. You can modify it before approval.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating event ID:', error);
    return NextResponse.json(
      { message: 'Error generating event ID' },
      { status: 500 }
    );
  }
}
