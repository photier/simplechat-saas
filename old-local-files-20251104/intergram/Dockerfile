FROM node:20-alpine

WORKDIR /app

# Güncellenmiş kaynak kodunu kopyala
COPY telegram-chat-widget/ .

# Bağımlılıkları yükle
RUN npm install --legacy-peer-deps && \
    npm run build

EXPOSE 3000

CMD ["npm", "start"]
