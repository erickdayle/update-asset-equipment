FROM node:18-slim

WORKDIR /app

COPY package*.json ./
COPY app.js ./
COPY update_parent.js ./

RUN npm install

CMD ["node", "app.js"]