FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

FROM base AS builder

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./

COPY libs ./libs
COPY apps/warehouse-service ./apps/warehouse-service

RUN npm ci

RUN npx prisma generate --schema=apps/warehouse-service/prisma/schema.prisma

RUN npm run build --filter=@cf-erp/warehouse-service

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/warehouse-service/dist ./dist
COPY --from=builder /app/apps/warehouse-service/package.json ./package.json
COPY --from=builder /app/apps/warehouse-service/prisma ./prisma

EXPOSE 3009

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]