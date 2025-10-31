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

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
