# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/
COPY shared ./shared

# Install dependencies
RUN npm ci

# Copy client source
COPY client ./client

# Build client
RUN npm run build --workspace=client

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install lightweight HTTP server
RUN npm install -g http-server

# Copy built client
COPY --from=builder /app/client/dist ./dist

EXPOSE 5173

CMD ["http-server", "dist", "-p", "5173", "--gzip", "--cors"]
