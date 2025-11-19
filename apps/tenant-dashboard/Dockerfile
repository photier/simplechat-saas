# Simple Dockerfile - Same as working stats dashboard
# Monorepo-compatible, single-stage build
FROM node:22-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Remove any existing lockfiles to avoid cache conflicts
RUN rm -f package-lock.json

# Install without running postinstall scripts (rollup patch-package issue)
# Fresh install from package.json only (no lockfile constraints)
RUN npm install --legacy-peer-deps --ignore-scripts

# Switch to tenant-dashboard directory
WORKDIR /app/apps/tenant-dashboard

# Build-time environment variables for Vite
# Railway automatically passes environment variables as ARG during build
ARG VITE_API_URL

# Make them available during build
ENV VITE_API_URL=$VITE_API_URL

# Build tenant-dashboard (Vite will copy public/* to dist/)
RUN npm run build

# Start Express server (serves dist folder with all static assets)
CMD ["node", "server.js"]
