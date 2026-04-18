FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY shared ./shared

# Install dependencies
RUN npm ci

# Copy server source
COPY server ./server

# Build TypeScript
RUN npm run build --workspace=server

EXPOSE 4000

CMD ["npm", "start", "--workspace=server"]
