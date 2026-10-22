FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache dumb-init tesseract-ocr

FROM base AS builder

COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./

COPY libs ./libs
COPY apps/document-service ./apps/document-service

RUN npm ci

RUN npx prisma generate --schema=apps/document-service/prisma/schema.prisma

RUN npm run build --filter=@cf-erp/document-service

FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/document-service/dist ./dist
COPY --from=builder /app/apps/document-service/package.json ./package.json
COPY --from=builder /app/apps/document-service/prisma ./prisma

EXPOSE 3007

USER node

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]