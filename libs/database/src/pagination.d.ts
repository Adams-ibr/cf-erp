import { Prisma } from '@prisma/client';
import { FilterOptions, PaginatedResult } from '@cf-erp/shared';
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
    take: number;
}
export interface SortParams {
    field: string;
    order: 'asc' | 'desc';
}
export declare function parsePaginationParams(options?: FilterOptions): PaginationParams;
export declare function parseSortParams(options?: FilterOptions): Prisma.Enumerable<Prisma.SortOrder> | undefined;
export declare function buildWhereClause<T>(baseWhere: T, options?: FilterOptions, searchFields?: string[]): T & {
    isDeleted: boolean;
};
export declare function paginate<T, K extends keyof T>(model: {
    findMany: (args: {
        where: T;
        skip: number;
        take: number;
        orderBy?: Prisma.Enumerable<Prisma.SortOrder>;
    }) => Promise<T[]>;
    count: (args: {
        where: T;
    }) => Promise<number>;
}, where: T, options?: FilterOptions): Promise<PaginatedResult<T>>;
export declare function createCursorPagination<T>(items: T[], cursorField: keyof T, limit: number): {
    data: T[];
    nextCursor: string | null;
    hasMore: boolean;
};
export interface CursorPaginationParams {
    cursor?: string;
    limit: number;
    direction?: 'forward' | 'backward';
}
export declare function parseCursorParams(params: CursorPaginationParams): {
    cursor?: string;
    limit: number;
    direction: 'forward' | 'backward';
};
