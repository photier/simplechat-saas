# Simple Dockerfile - Same as working stats dashboard
# Monorepo-compatible, single-stage build
FROM node:22-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install without running postinstall scripts (rollup patch-package issue)
RUN npm install --legacy-peer-deps --ignore-scripts

# Switch to tenant-dashboard directory
WORKDIR /app/apps/tenant-dashboard

# Build-time environment variables for Vite
# Railway automatically passes environment variables as ARG during build
ARG VITE_API_URL

# Make them available during build
ENV VITE_API_URL=$VITE_API_URL

# Debug: Check public folder before build
RUN echo "=== Checking public/ folder BEFORE build ===" && \
    ls -la public/ && \
    echo "=== Checking public/media/app/ ===" && \
    ls -la public/media/app/ | wc -l

# Build tenant-dashboard (Vite will copy public/* to dist/)
# Cache bust: 2025-11-13-22:01
RUN npm run build

# Debug: Check dist contents
RUN echo "=== Checking dist/ contents ===" && \
    ls -la dist/ && \
    echo "=== Checking for logo.png ===" && \
    ls -la dist/logo.png || echo "logo.png NOT FOUND" && \
    echo "=== Checking dist/media/app/ ===" && \
    ls -la dist/media/app/ || echo "media/app/ NOT FOUND"

# Start Express server (serves dist folder with all static assets)
CMD ["node", "server.js"]
