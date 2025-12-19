import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/mongodb';

export async function GET() {
  try {
    const healthStatus = await checkDatabaseHealth();

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

    return NextResponse.json(
      {
        service: 'Eventify API',
        status: healthStatus.status,
        database: healthStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      {
        service: 'Eventify API',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      { status: 500 }
    );
  }
}
