import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const prismaMiddleware = {
  async softDeleteMiddleware(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        isDeleted: false,
      };
    }
    if (params.action === 'findMany') {
      if (!params.args.where) {
        params.args.where = {};
      }
      params.args.where.isDeleted = false;
    }
    return next(params);
  },

  async auditMiddleware(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) {
    const startTime = Date.now();
    const result = await next(params);
    const duration = Date.now() - startTime;

    if (params.action === 'create' || params.action === 'update' || params.action === 'delete') {
      // Audit logging would go here
      // await auditService.log({ ... });
    }

    return result;
  },
};

prisma.$use(prismaMiddleware.softDeleteMiddleware);
prisma.$use(prismaMiddleware.auditMiddleware);

export type PrismaTransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function withTransaction<T>(
  callback: (tx: PrismaTransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(callback, {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  });
}

export { Prisma };