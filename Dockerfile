FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3

COPY package*.json ./
COPY app.js ./
COPY update_parent.js ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "app.js"]