import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for dashboard
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Get port from environment or default to 3000
  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Backend API is running on: http://localhost:${port}`);
}

bootstrap();
