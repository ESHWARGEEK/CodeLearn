FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S sandbox && \
    adduser -S sandbox -u 1001

# Create temp directory for code execution
RUN mkdir -p /tmp/sandbox && \
    chown -R sandbox:sandbox /tmp/sandbox

# Switch to non-root user
USER sandbox

# Expose port (not used but good practice)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Start the application
CMD ["node", "dist/index.js"]
