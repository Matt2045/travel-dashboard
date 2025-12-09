# ============================================
# Stage 1: Build Stage
# ============================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments für öffentliche Env-Variablen (werden beim Build eingebunden)
ARG VITE_SYNCFUSION_LICENSE_KEY
ARG VITE_APPWRITE_PROJECT_ID
ARG VITE_APPWRITE_API_ENDPOINT
ARG VITE_APPWRITE_DATABASE_ID
ARG VITE_APPWRITE_USERS_COLLECTION_ID
ARG VITE_APPWRITE_TRIPS_COLLECTION_ID

# Setze Build-Zeit Env-Variablen
ENV VITE_SYNCFUSION_LICENSE_KEY=$VITE_SYNCFUSION_LICENSE_KEY
ENV VITE_APPWRITE_PROJECT_ID=$VITE_APPWRITE_PROJECT_ID
ENV VITE_APPWRITE_API_ENDPOINT=$VITE_APPWRITE_API_ENDPOINT
ENV VITE_APPWRITE_DATABASE_ID=$VITE_APPWRITE_DATABASE_ID
ENV VITE_APPWRITE_USERS_COLLECTION_ID=$VITE_APPWRITE_USERS_COLLECTION_ID
ENV VITE_APPWRITE_TRIPS_COLLECTION_ID=$VITE_APPWRITE_TRIPS_COLLECTION_ID

# Build the application
RUN npm run build

# ============================================
# Stage 2: Production Stage
# ============================================

FROM node:20-alpine

WORKDIR /app

# Copy package Files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/instrument.server.mjs ./instrument.server.mjs

# Expose port (React Router standard port)
EXPOSE 3000

ENV NODE_ENV=production
ENV NODE_OPTIONS="--import ./instrument.server.mjs"

# Start application auf Port 3000
CMD ["npx", "react-router-serve", "./build/server/index.js"]