# ============================================
# Multi-stage Dockerfile for React 19 + Vite 7
# Production-ready, optimized for Railway
# ============================================

# ============================================
# Stage 1: Dependencies (cached layer)
# ============================================
FROM node:22-alpine AS deps

# Install security updates and build tools
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* .npmrc ./

# Install dependencies with npm ci (faster, deterministic)
RUN npm ci --legacy-peer-deps

# ============================================
# Stage 2: Builder (build the app)
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production Runtime (minimal)
# ============================================
FROM node:22-alpine AS runner

# Install only runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy built app and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Install only production dependencies (express, serve)
RUN npm ci --omit=dev --legacy-peer-deps && \
    npm cache clean --force

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]
