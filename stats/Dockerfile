FROM node:22-alpine

WORKDIR /app

# Copy package files and .npmrc for legacy-peer-deps
COPY package*.json ./
COPY .npmrc ./

# Install dependencies (uses legacy-peer-deps from .npmrc)
RUN npm install --production

# Copy application files
COPY . .

EXPOSE 3002

CMD ["npm", "start"]
