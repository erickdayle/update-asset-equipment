FROM node:18-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
   python3 \
   python3-pip

COPY package*.json ./
COPY app.js ./
COPY update_parent.js ./
COPY requirements.txt ./

RUN npm install
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["node", "app.js"]