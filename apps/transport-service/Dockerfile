FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

FROM base AS builder

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./

COPY libs ./libs
COPY apps/transport-service ./apps/transport-service

RUN npm ci

RUN npx prisma generate --schema=apps/transport-service/prisma/schema.prisma

RUN npm run build --filter=@cf-erp/transport-service

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/transport-service/dist ./dist
COPY --from=builder /app/apps/transport-service/package.json ./package.json
COPY --from=builder /app/apps/transport-service/prisma ./prisma

EXPOSE 3010

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]