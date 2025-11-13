# ============================================
# Production-ready Multi-stage Dockerfile
# Simple Chat SaaS Backend - NestJS + Prisma
# ============================================

# Stage 1: Dependencies (cached layer)
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies with retry logic
RUN npm install --production --no-audit --maxsockets 1 && \
    npm cache clean --force

# Stage 2: Build tenant-dashboard
FROM node:22-alpine AS tenant-builder
WORKDIR /app

# Copy entire monorepo for tenant-dashboard build
COPY . .

# Install dependencies and build tenant-dashboard
RUN npm install --legacy-peer-deps --ignore-scripts
WORKDIR /app/apps/tenant-dashboard
RUN npm run build

# Stage 3: Build backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install dev dependencies and build
RUN npm install --no-audit --maxsockets 1 && \
    npx prisma generate && \
    npm run build && \
    npm prune --production

# Stage 4: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy only necessary files
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy tenant-dashboard build
COPY --from=tenant-builder --chown=nestjs:nodejs /app/apps/tenant-dashboard/dist ./tenant-dashboard

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command
CMD ["npm", "run", "start:prod"]
