FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY app ./app

EXPOSE 1883
CMD ["node", "app/index.js"]
