# ===========================
# Stage 1: Install dependencies
# ===========================
FROM node:22-alpine AS deps
WORKDIR /app

# Copy entire monorepo (Railway needs full context)
COPY . .

# Install dependencies with React 19 compatibility
RUN npm install --legacy-peer-deps --ignore-scripts

# ===========================
# Stage 2: Build the app
# ===========================
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy tenant-dashboard source
COPY apps/tenant-dashboard ./apps/tenant-dashboard

# Build tenant-dashboard
WORKDIR /app/apps/tenant-dashboard

# Build-time environment variables for Vite
# Railway automatically passes environment variables as ARG during build
ARG VITE_API_URL

# Make them available during build
ENV VITE_API_URL=$VITE_API_URL

# Build with embedded environment variables
RUN npm run build

# ===========================
# Stage 3: Production server
# ===========================
FROM node:22-alpine
WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/tenant-dashboard/dist ./dist
COPY --from=builder /app/apps/tenant-dashboard/package.json ./

# Install serve to host static files
RUN npm install -g serve

# Expose port (Railway will set PORT env var)
EXPOSE ${PORT:-3000}

# Start server (use Railway's PORT env var or fallback to 3000)
CMD sh -c "serve -s dist -l ${PORT:-3000}"
