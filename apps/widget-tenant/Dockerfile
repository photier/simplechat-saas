# Widget Tenant Dockerfile - React 19 + Vite 7
# Force TypeScript rebuild with --force flag
FROM node:22-alpine

WORKDIR /app

# Copy entire monorepo
COPY . .

# Clean any cached node_modules
RUN rm -rf node_modules apps/*/node_modules

# Install all dependencies (ignore postinstall scripts for rollup)
RUN npm install --legacy-peer-deps --ignore-scripts

# Go to widget-tenant directory
WORKDIR /app/apps/widget-tenant

# Clean old build artifacts before building
RUN rm -rf static dist

# Build widget
RUN npm run build

# Start server
CMD ["node", "server.cjs"]
