FROM node:18-slim
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-freefont-ttf libxss1 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=7860
EXPOSE 7860
CMD ["node", "index.js"]
