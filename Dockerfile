FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder

COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/zion_aromas?schema=public
ENV AUTH_SECRET=build-time-secret
ENV AUTH_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV ADMIN_PASSWORD=build-time-admin-password

RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps /app/node_modules ./node_modules

RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
