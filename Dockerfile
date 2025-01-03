FROM node:18-slim

WORKDIR /app

COPY package*.json ./
COPY app.js ./
COPY update_parent.js ./

RUN npm install

# Add entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]