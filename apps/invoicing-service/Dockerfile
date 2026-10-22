FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init

FROM base AS builder

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./

COPY libs ./libs
COPY apps/invoicing-service ./apps/invoicing-service

RUN npm ci

RUN npx prisma generate --schema=apps/invoicing-service/prisma/schema.prisma

RUN npm run build --filter=@cf-erp/invoicing-service

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/invoicing-service/dist ./dist
COPY --from=builder /app/apps/invoicing-service/package.json ./package.json
COPY --from=builder /app/apps/invoicing-service/prisma ./prisma

EXPOSE 3014

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]