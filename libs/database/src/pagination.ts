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

export function parsePaginationParams(options?: FilterOptions): PaginationParams {
  const page = Math.max(1, options?.page || 1);
  const limit = Math.min(Math.max(1, options?.limit || 20), 100);
  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
}

export function parseSortParams(options?: FilterOptions): Prisma.Enumerable<Prisma.SortOrder> | undefined {
  if (!options?.sortBy) {
    return undefined;
  }

  const order = options.sortOrder || 'desc';
  return { [options.sortBy]: order };
}

export function buildWhereClause<T>(
  baseWhere: T,
  options?: FilterOptions,
  searchFields: string[] = [],
): T & { isDeleted: boolean } {
  const where = {
    ...baseWhere,
    isDeleted: false,
  } as T & { isDeleted: boolean };

  if (options?.branchId) {
    (where as Record<string, unknown>).branchId = options.branchId;
  }

  if (options?.search && searchFields.length > 0) {
    (where as Record<string, unknown>).OR = searchFields.map(field => ({
      [field]: { contains: options.search, mode: 'insensitive' },
    }));
  }

  if (options?.filters) {
    Object.assign(where, options.filters);
  }

  return where;
}

export async function paginate<T, K extends keyof T>(
  model: {
    findMany: (args: { where: T; skip: number; take: number; orderBy?: Prisma.Enumerable<Prisma.SortOrder> }) => Promise<T[]>;
    count: (args: { where: T }) => Promise<number>;
  },
  where: T,
  options?: FilterOptions,
): Promise<PaginatedResult<T>> {
  const { page, limit, skip, take } = parsePaginationParams(options);
  const orderBy = parseSortParams(options);

  const [data, total] = await Promise.all([
    model.findMany({ where, skip, take, orderBy }),
    model.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function createCursorPagination<T>(
  items: T[],
  cursorField: keyof T,
  limit: number,
): { data: T[]; nextCursor: string | null; hasMore: boolean } {
  const data = items.slice(0, limit + 1);
  const hasMore = data.length > limit;
  const result = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore && result.length > 0
    ? String(result[result.length - 1][cursorField])
    : null;

  return { data: result, nextCursor, hasMore };
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  direction?: 'forward' | 'backward';
}

export function parseCursorParams(params: CursorPaginationParams): { cursor?: string; limit: number; direction: 'forward' | 'backward' } {
  return {
    cursor: params.cursor,
    limit: Math.min(Math.max(1, params.limit), 100),
    direction: params.direction || 'forward',
  };
}