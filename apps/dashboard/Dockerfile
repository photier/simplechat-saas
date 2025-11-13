# ===========================
# Stage 1: Install dependencies
# ===========================
FROM node:22-alpine AS deps
WORKDIR /app

# Copy entire monorepo for dependency resolution
COPY package*.json ./
COPY apps/dashboard/package*.json ./apps/dashboard/

# Install dependencies with React 19 compatibility
RUN npm install --legacy-peer-deps --ignore-scripts

# ===========================
# Stage 2: Build the app
# ===========================
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/dashboard/node_modules ./apps/dashboard/node_modules

# Copy workspace config
COPY package*.json ./
COPY turbo.json ./

# Copy dashboard source AND public assets
COPY apps/dashboard ./apps/dashboard

# Build dashboard
WORKDIR /app/apps/dashboard

# Build-time environment variables for Vite
ARG VITE_BACKEND_URL
ARG VITE_STATS_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_STATS_API_URL=$VITE_STATS_API_URL

# Build (Vite will copy public/* to dist/)
RUN npm run build

# ===========================
# Stage 3: Production runtime
# ===========================
FROM node:22-alpine AS runner
WORKDIR /app

# Copy only production files
COPY --from=builder /app/apps/dashboard/dist ./dist
COPY --from=builder /app/apps/dashboard/server.js ./server.js
COPY --from=builder /app/apps/dashboard/package.json ./package.json

# Install only production dependencies for Express server
RUN npm install --omit=dev express

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port (Railway will set PORT env var)
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Express server
CMD ["node", "server.js"]
