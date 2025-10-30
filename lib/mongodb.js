import mongoose from 'mongoose';

// Simple cached connection
let cachedConnection = null;

export const connectMongoDB = async () => {
  // Return cached connection if exists
  if (cachedConnection) {
    return cachedConnection;
  }

  // Connect to MongoDB with basic options
  await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 10,
  });

  cachedConnection = mongoose.connection;
  console.log('✅ Connected to MongoDB');

  return cachedConnection;
};

// Health check function for database connectivity
export const checkDatabaseHealth = async () => {
  try {
    // Ensure connection is established
    if (!cachedConnection) {
      await connectMongoDB();
    }

    // Ping the database
    await mongoose.connection.db.admin().ping();

    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      uptime: process.uptime(),
      connectionState: mongoose.connection.readyState, // 1 = connected
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error.message}`,
      error: error.message,
      connectionState: mongoose.connection.readyState,
    };
  }
};
