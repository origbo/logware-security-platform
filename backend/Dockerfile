# Dockerfile for the Logware Security Platform Backend
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Create directory for logs
RUN mkdir -p /app/logs && \
    chown -R node:node /app/logs

# Switch to non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/health || exit 1

# Expose API port
EXPOSE 8080

# Start the application
CMD ["node", "src/server.js"]
