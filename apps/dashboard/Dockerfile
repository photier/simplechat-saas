# Dashboard - React 19 + Vite build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and .npmrc for legacy-peer-deps
COPY package*.json ./
COPY .npmrc ./

# Install dependencies (uses legacy-peer-deps from .npmrc)
RUN npm install

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
COPY .npmrc ./
RUN npm install --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
