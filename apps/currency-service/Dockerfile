FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

FROM base AS builder

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./

COPY libs ./libs
COPY apps/currency-service ./apps/currency-service

RUN npm ci

RUN npx prisma generate --schema=apps/currency-service/prisma/schema.prisma

RUN npm run build --filter=@cf-erp/currency-service

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/currency-service/dist ./dist
COPY --from=builder /app/apps/currency-service/package.json ./package.json
COPY --from=builder /app/apps/currency-service/prisma ./prisma

EXPOSE 3025

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]