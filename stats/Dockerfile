# Stats Backend Dockerfile - Node.js Express + Socket.io
FROM node:22-alpine

WORKDIR /app

# Copy stats backend files
COPY stats/package.json ./
COPY stats/server.js ./
COPY stats/public ./public

# Install only production dependencies
RUN npm install --omit=dev

# Expose port (Railway provides PORT env var)
EXPOSE 3002

# Start server
CMD ["node", "server.js"]
