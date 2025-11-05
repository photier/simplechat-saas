FROM node:22-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all files
COPY . ./

EXPOSE 3002

CMD ["npm", "start"]
