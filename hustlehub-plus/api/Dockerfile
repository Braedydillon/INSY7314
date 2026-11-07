FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src
ENV NODE_ENV=production PORT=5000 USE_HTTPS=false
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
