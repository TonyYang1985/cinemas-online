# ==================================
# Building Stage
# ==================================
FROM ghcr.io/tonyyang1985/base_node:latest AS builder

# Set to development to ensure devDependencies are available
ENV NODE_ENV=development

WORKDIR /fot.sg/build

# Copy dependency files first (better caching)
COPY package.json yarn.lock* tsconfig.json ./

# Install all dependencies
RUN yarn install --frozen-lockfile --non-interactive

# Verify tools are available
RUN echo "=== Verifying Build Tools ===" && \
    which ncc && ncc --version && echo "✅ NCC OK" && \
    which tsc && tsc --version && echo "✅ TypeScript OK" && \
    test -f tsconfig.json && echo "✅ tsconfig.json OK" && \
    echo "=== All tools verified ==="

# Copy source code
COPY . .

# Build application
RUN yarn run buildNum && yarn run ncc:build

# Clean up development files
RUN rm -f ./cfg/*.development.yaml ./cfg/*.development.yml

# ==================================
# Production Stage
# ==================================
FROM node:22-alpine

# Metadata
LABEL maintainer="FOT Team" \
      description="FOT Node API Framework" \
      version="1.0.13" \
      org.opencontainers.image.source="https://github.com/TonyYang1985/your-app" \
      org.opencontainers.image.description="FOT Node.js API Application" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /fot.sg/app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tzdata \
    tini && \
    rm -rf /var/cache/apk/*

# Set timezone
ENV TZ=Asia/Singapore

# Copy built artifacts from builder stage
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

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/_healthcheck || exit 1

# Use tini as init process
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "./dist/single/index.js"]