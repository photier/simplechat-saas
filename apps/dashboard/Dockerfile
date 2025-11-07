# Basit Dockerfile - Monorepo için
FROM node:22-alpine

WORKDIR /app

# Tüm kodu kopyala
COPY . .

# Root'tan tüm dependencies yükle (monorepo workspace)
RUN npm install --legacy-peer-deps

# Dashboard dizinine geç
WORKDIR /app/apps/dashboard

# Dashboard'u build et
RUN npm run build

# Server'ı başlat
CMD ["node", "server.js"]
