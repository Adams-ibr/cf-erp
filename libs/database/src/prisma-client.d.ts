import { PrismaClient, Prisma } from '@prisma/client';
declare global {
    var prisma: PrismaClient | undefined;
}
export declare const prisma: any;
export declare const prismaMiddleware: {
    softDeleteMiddleware(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>): Promise<unknown>;
    auditMiddleware(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>): Promise<unknown>;
};
export type PrismaTransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;
export declare function withTransaction<T>(callback: (tx: PrismaTransactionClient) => Promise<T>): Promise<T>;
export { Prisma };
