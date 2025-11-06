# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* .npmrc ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Build
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Add server.js for serving
COPY server.js ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
