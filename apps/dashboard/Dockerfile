FROM node:22-alpine

WORKDIR /app

# Copy package files and .npmrc
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
