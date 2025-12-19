import { connectMongoDB } from '@/lib/mongodb';
import Logs from '@/models/log';

export async function logger(userId, action, logType, status) {
  if (process.env.IS_DEV === 'true') {
    return;
  }

  try {
    await connectMongoDB();
    const log = await Logs.create({
      user_id: ['UNKNOWN', 'SYSTEM'].includes(userId) ? null : userId,
      action: action,
      logType: logType,
      status: status,
    });
  } catch (e) {
    console.error('Error Creating Log: ', e);
  }
}
