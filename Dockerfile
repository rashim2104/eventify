# Dockerfile for Next.js with pdfkit
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
# Using npm install with --legacy-peer-deps to resolve dependency conflicts
# npm ci requires lock file to be in sync, so using npm install instead
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Copy pdfkit font files to the build output directory
# pdfkit fonts are needed at runtime. The error shows Next.js expects them in .next/server/chunks/data/
RUN if [ -d "/app/node_modules/pdfkit/js/data" ]; then \
      mkdir -p /app/.next/server/chunks/data && \
      cp /app/node_modules/pdfkit/js/data/*.afm /app/.next/server/chunks/data/ && \
      echo "✓ Copied pdfkit fonts to .next/server/chunks/data/"; \
    else \
      echo "⚠ Warning: pdfkit/js/data directory not found"; \
    fi

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
