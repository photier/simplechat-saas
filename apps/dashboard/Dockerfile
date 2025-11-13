# Basit Dockerfile - Monorepo için
# Updated: 2025-11-11 - Mobile responsive fixes
FROM node:22-alpine

WORKDIR /app

# Tüm kodu kopyala
COPY . .

# Install without running postinstall scripts (rollup patch-package issue)
RUN npm install --legacy-peer-deps --ignore-scripts

# Dashboard dizinine geç
WORKDIR /app/apps/dashboard

# Build-time environment variables for Vite
# Railway automatically passes environment variables as ARG during build
ARG VITE_BACKEND_URL
ARG VITE_STATS_API_URL

# Make them available during build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_STATS_API_URL=$VITE_STATS_API_URL

# Dashboard'u build et (Vite will embed these variables)
RUN npm run build

# Server'ı başlat
CMD ["node", "server.js"]
