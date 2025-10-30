# Multi-stage Dockerfile using Playwright base + Bun for Next.js
# Ensures Chromium and all dependencies are available for PDF generation

# Use Playwright image matching package.json (playwright 1.48.2)
FROM mcr.microsoft.com/playwright:v1.48.2-jammy AS deps
WORKDIR /app

# Install unzip (required for Bun installer) and Bun
RUN apt-get update && apt-get install -y unzip \
  && curl -fsSL https://bun.sh/install | bash \
  && ln -s /root/.bun/bin/bun /usr/local/bin/bun \
  && ln -s /root/.bun/bin/bunx /usr/local/bin/bunx

# Copy only manifests for better layer caching
COPY package.json bun.lock ./

# Install dependencies using Bun lockfile
ENV NODE_ENV=production
RUN bun install --frozen-lockfile


FROM mcr.microsoft.com/playwright:v1.48.2-jammy AS builder
WORKDIR /app

# Install unzip and Bun
RUN apt-get update && apt-get install -y unzip \
  && curl -fsSL https://bun.sh/install | bash \
  && ln -s /root/.bun/bin/bun /usr/local/bin/bun \
  && ln -s /root/.bun/bin/bunx /usr/local/bin/bunx

# Copy deps and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
ENV NODE_ENV=production
RUN bun run build


FROM mcr.microsoft.com/playwright:v1.48.2-jammy AS runner
WORKDIR /app

# Install unzip and Bun
RUN apt-get update && apt-get install -y unzip \
  && curl -fsSL https://bun.sh/install | bash \
  && ln -s /root/.bun/bin/bun /usr/local/bin/bun \
  && ln -s /root/.bun/bin/bunx /usr/local/bin/bunx

# Environment
ENV NODE_ENV=production
ENV PORT=3000
# Ensure Playwright uses the preinstalled browsers
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
EXPOSE 3000

# Copy runtime assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock
COPY --from=builder /app/node_modules ./node_modules

# Include server-side source for Next API routes
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/models ./models
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/postcss.config.js ./postcss.config.js
COPY --from=builder /app/jsconfig.json ./jsconfig.json

# Optional: verify Chromium present (commented to avoid slowing build)
# RUN bunx playwright install --with-deps chromium

# Healthcheck using curl (preinstalled in Playwright image)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:${PORT}/api/health || exit 1

# Start app
CMD ["bun", "run", "start"]
