# Build stage
FROM node:22-alpine AS builder

# Install build dependencies for native modules (better-sqlite3, prisma, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json tsconfig.base.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy all source code for monorepo build
COPY backend ./backend
COPY frontend ./frontend

# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate

# Build backend using Nx
WORKDIR /app
RUN npx nx build backend --configuration=production

# Production stage
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (ignore scripts like husky prepare)
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist/backend ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nodejs:nodejs /app/backend/prisma ./prisma

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["node", "dist/main.js"]
