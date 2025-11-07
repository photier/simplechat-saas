# Stats Backend Dockerfile - Node.js Express + Socket.io
FROM node:22-alpine

WORKDIR /app

# Copy all stats backend files
COPY . .

# Install only production dependencies
RUN npm install --omit=dev

# Expose port (Railway provides PORT env var)
EXPOSE 3002

# Start server
CMD ["node", "server.js"]
