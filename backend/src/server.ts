import { buildApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function startServer() {
  await connectDatabase();

  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 DISISTA CONTROL API running on http://${env.HOST}:${env.PORT}`);
    console.log(`📖 OpenAPI Interactive Docs available at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful Shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\n🛑 Received ${signal}, initiating graceful operational shutdown...`);
      await app.close();
      await disconnectDatabase();
      console.log('✅ Server and database disconnected cleanly.');
      process.exit(0);
    });
  });
}

startServer();
