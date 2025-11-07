# Widget Premium Dockerfile - React 19 + Vite 7
FROM node:22-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install all dependencies (ignore postinstall scripts for rollup)
RUN npm install --legacy-peer-deps --ignore-scripts

# Go to widget-premium directory
WORKDIR /app/apps/widget-premium

# Build widget
RUN npm run build

# Start server
CMD ["node", "server.cjs"]
