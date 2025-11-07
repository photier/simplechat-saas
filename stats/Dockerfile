# Stats Backend Dockerfile - works from monorepo root
FROM node:22-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Go to stats directory
WORKDIR /app/stats

# Install only production dependencies
RUN npm install --omit=dev

# Start server
CMD ["node", "server.js"]
