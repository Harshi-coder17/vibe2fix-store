# Stage 1: Build React Frontend
FROM node:20-alpine AS client-builder
WORKDIR /build
COPY client/package*.json ./
RUN npm ci --ignore-scripts
COPY client/ ./
RUN npm run build

# Stage 2: Express Backend & Production Single-Container Delivery
FROM node:20-alpine
WORKDIR /app

# Prisma's database engine needs OpenSSL, which node:20-alpine does not include.
# Without it every shop crashes on its first database query.
RUN apk add --no-cache openssl

COPY server/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY server/ .
COPY --from=client-builder /build/dist ./public

RUN npx prisma generate \
 # Download the schema engine now: the shops have no internet access at runtime,
 # and seeding (prisma db push) needs it.
 && npx prisma version

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
 && mkdir -p /app/uploads \
 && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-5000}/api/health" || exit 1

CMD ["node", "src/server.js"]
