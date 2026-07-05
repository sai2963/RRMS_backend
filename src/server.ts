import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('💥 Unhandled Rejection:', reason);
    void shutdown('unhandledRejection');
  });
};

void startServer();
