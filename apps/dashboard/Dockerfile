# Basit Dockerfile - Monorepo için
FROM node:22-alpine

WORKDIR /app

# Tüm kodu kopyala
COPY . .

# Install without running postinstall scripts (rollup patch-package issue)
RUN npm install --legacy-peer-deps --ignore-scripts

# Dashboard dizinine geç
WORKDIR /app/apps/dashboard

# Dashboard'u build et
RUN npm run build

# Server'ı başlat
CMD ["node", "server.js"]
