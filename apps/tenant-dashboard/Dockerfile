# Simple Dockerfile for tenant-dashboard - Monorepo compatible
# Updated: 2025-11-13 - Multi-tenant SaaS
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

# Build tenant-dashboard (Vite will embed these variables)
RUN npm run build

# Start Express server (serves dist folder with static assets)
CMD ["node", "server.js"]
