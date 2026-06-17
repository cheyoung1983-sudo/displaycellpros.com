# Stage 1: Build the application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy the local dependency required by package.json
COPY src/dataconnect-admin-generated ./src/dataconnect-admin-generated

# Use a cache mount to persist the npm cache across builds, significantly speeding up re-installs
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Copy the rest of the source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Remove development dependencies so node_modules is ready for production
RUN npm prune --omit=dev

# Stage 2: Production runtime
FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

# Copy build artifacts and the production node_modules directly from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/dataconnect-admin-generated ./src/dataconnect-admin-generated
COPY --from=builder /app/package*.json ./

# Cloud Run listens on 8080 by default
EXPOSE 8080

CMD ["npm", "start"]