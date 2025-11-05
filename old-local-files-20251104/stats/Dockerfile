FROM node:18-alpine

# Install dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install --production

# Copy application files
COPY server.js ./
COPY public/ ./public/

# Expose port
EXPOSE 3002

# Start the server
CMD ["npm", "start"]
