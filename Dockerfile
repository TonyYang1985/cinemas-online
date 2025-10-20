# ==================================
# Building Stage
# ==================================
FROM yxj1985/base_node:latest AS builder

# Ensure we're NOT in production mode during build
ENV NODE_ENV=production

# Set working directory
WORKDIR /fot.sg/build

# Copy package files first for better layer caching
COPY package.json yarn.lock* ./

# Install ALL dependencies including devDependencies
RUN yarn install --frozen-lockfile --non-interactive --production=false

# Copy source code
COPY . .

# Build application
RUN yarn run buildNum && yarn run ncc:build

# Remove development configuration files
RUN rm -f ./cfg/*.development.yaml ./cfg/*.development.yml

# ==================================
# Production Stage
# ==================================
FROM node:22-alpine

# Add metadata labels
LABEL maintainer="FOT Team" \
      description="Base Node API Framework" \
      version="1.0.13"

# Set working directory
WORKDIR /fot.sg/app

# Install runtime dependencies only
RUN apk add --no-cache \
    curl \
    tzdata \
    tini \
    && rm -rf /var/cache/apk/*

# Set timezone (optional, change as needed)
ENV TZ=Asia/Singapore

# Copy built artifacts from builder
COPY --from=builder /fot.sg/build/dist/single/*.js ./dist/single/
COPY --from=builder /fot.sg/build/cfg ./cfg
COPY --from=builder /fot.sg/build/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /fot.sg/app

# Switch to non-root user
USER nodejs

# Set production environment
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=2048"

# Expose application port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/_healthcheck || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "./dist/single/index.js"]