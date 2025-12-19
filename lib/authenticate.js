import { getServerSession } from 'next-auth/next';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';

export async function authenticate(req, authOptions, origin) {
  try {
    const session = await getServerSession({ req, authOptions });
    if (!session) {
      throw new Error('Bad Request.');
    }

    await connectMongoDB();
    const user = await User.findOne(
      { email: session.user.email },
      { password: 0 }
    );

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  } catch (error) {
    throw error;
  }
}
