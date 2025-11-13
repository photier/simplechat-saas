import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable cookie parser for HttpOnly cookies
  app.use(cookieParser());

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for tenant subdomains (credentials: true allows cookies)
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // In production: allow *.simplechat.bot wildcard subdomains
      if (isProduction) {
        const allowedPattern = /^https:\/\/([a-z0-9-]+\.)?simplechat\.bot$/;
        if (allowedPattern.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }

      // In development: allow localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // ✅ Required for cookies to work
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Serve tenant-dashboard static files for wildcard subdomains
  const tenantDashboardPath = join(__dirname, '..', 'tenant-dashboard');
  app.use(express.static(tenantDashboardPath));

  // SPA fallback: Serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Only serve SPA for non-API routes (let API routes pass through)
    if (!req.path.startsWith('/api') && !req.path.startsWith('/auth') && !req.path.startsWith('/health')) {
      res.sendFile(join(tenantDashboardPath, 'index.html'));
    } else {
      next();
    }
  });

  // Get port from environment or default to 3000
  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 Backend API is running on: http://localhost:${port}`);
  console.log(`📊 Tenant Dashboard serving from: ${tenantDashboardPath}`);
}

bootstrap();
