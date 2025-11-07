# syntax=docker/dockerfile:1.4
# Modern multi-stage Dockerfile for React 19 + Vite 7
# Optimized for Railway deployment (2025)

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-alpine AS deps

# Install essential build tools
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# ============================================
# Stage 2: Builder
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production runner
# ============================================
FROM node:22-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy only production files
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps && \
    npm cache clean --force

# Switch to non-root user
USER nodejs

# Railway provides PORT env var dynamically
ENV NODE_ENV=production
EXPOSE ${PORT:-3002}

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "server.js"]
