# Widget Dockerfile - React 19 + Vite 7
FROM node:22-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Install all dependencies (ignore postinstall scripts for rollup)
RUN npm install --legacy-peer-deps --ignore-scripts

# Go to widget directory
WORKDIR /app/apps/widget

# Clean old build artifacts before building
RUN rm -rf static dist

# Build widget
RUN npm run build

# Start server
CMD ["node", "server.cjs"]
