# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY frontend ./frontend

# Build frontend using Nx with production configuration
RUN npx nx build frontend --prod --output-path=dist/frontend

# Production stage - nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Create nginx user if not exists and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl --fail http://localhost:80/ || exit 1

# Switch to non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
