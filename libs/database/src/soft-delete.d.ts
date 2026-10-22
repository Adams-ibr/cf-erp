import { Prisma } from '@prisma/client';
export interface SoftDeleteFields {
    isDeleted: boolean;
    deletedAt: Date | null;
    deletedBy: string | null;
}
export interface SoftDeleteInput {
    isDeleted: true;
    deletedAt: Date;
    deletedBy: string;
}
export interface RestoreInput {
    isDeleted: false;
    deletedAt: null;
    deletedBy: null;
}
export declare function createSoftDeleteInput(userId: string): SoftDeleteInput;
export declare function createRestoreInput(): RestoreInput;
export declare function addSoftDeleteWhere<T extends Record<string, unknown>>(where: T): T & {
    isDeleted: boolean;
};
export declare function addSoftDeleteToInclude<T extends Record<string, unknown>>(include: T): T;
export declare const softDeleteMiddleware: (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) => Promise<unknown>;
export declare function withSoftDelete<T extends {
    isDeleted?: boolean;
}>(model: {
    findUnique: (args: {
        where: T;
    }) => Promise<T | null>;
    findFirst: (args: {
        where: T;
    }) => Promise<T | null>;
    findMany: (args: {
        where: T;
    }) => Promise<T[]>;
    update: (args: {
        where: T;
        data: Partial<T>;
    }) => Promise<T>;
    updateMany: (args: {
        where: T;
        data: Partial<T>;
    }) => Promise<{
        count: number;
    }>;
}): {
    findUnique(where: T): Promise<T>;
    findFirst(where: T): Promise<T>;
    findMany(where: T): Promise<T[]>;
    update(where: T, data: Partial<T>): Promise<T>;
    updateMany(where: T, data: Partial<T>): Promise<{
        count: number;
    }>;
    softDelete(where: T, userId: string): Promise<{
        count: number;
    }>;
    restore(where: T): Promise<{
        count: number;
    }>;
};
export declare function createAuditFields(userId: string): {
    createdBy: string;
    updatedBy: string;
};
export declare function updateAuditFields(userId: string): {
    updatedBy: string;
    updatedAt: Date;
};
