import { PrismaClient } from '@prisma/client';
import { FilterOptions, PaginatedResult } from '@cf-erp/shared';
export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    deletedAt?: Date | null;
}
export interface TenantEntity extends BaseEntity {
    tenantId: string;
    branchId?: string | null;
}
export declare abstract class BaseRepository<T extends TenantEntity, CreateInput, UpdateInput, WhereInput, WhereUniqueInput> {
    protected abstract model: PrismaClient[keyof PrismaClient];
    protected abstract modelName: string;
    protected get client(): PrismaClient;
    findById(id: string, tenantId: string): Promise<T | null>;
    findByIdWithBranch(id: string, tenantId: string, branchId: string): Promise<T | null>;
    findAll(tenantId: string, options?: FilterOptions): Promise<PaginatedResult<T>>;
    findByTenant(tenantId: string, options?: FilterOptions): Promise<PaginatedResult<T>>;
    findByTenantAndBranch(tenantId: string, branchId: string, options?: FilterOptions): Promise<PaginatedResult<T>>;
    create(data: CreateInput, tenantId: string, userId: string, branchId?: string): Promise<T>;
    update(id: string, data: UpdateInput, tenantId: string, userId: string): Promise<T>;
    delete(id: string, tenantId: string, userId: string): Promise<T>;
    softDelete(id: string, tenantId: string, userId: string): Promise<T>;
    restore(id: string, tenantId: string, userId: string): Promise<T>;
    count(tenantId: string, filters?: Record<string, unknown>): Promise<number>;
    exists(id: string, tenantId: string): Promise<boolean>;
    existsInBranch(id: string, tenantId: string, branchId: string): Promise<boolean>;
    protected buildSearchConditions(search: string): Record<string, unknown>[];
    findManyByIds(ids: string[], tenantId: string): Promise<T[]>;
    bulkCreate(data: CreateInput[], tenantId: string, userId: string, branchId?: string): Promise<{
        count: number;
    }>;
    bulkUpdate(ids: string[], data: UpdateInput, tenantId: string, userId: string): Promise<{
        count: number;
    }>;
    bulkDelete(ids: string[], tenantId: string, userId: string): Promise<{
        count: number;
    }>;
}
export declare abstract class BaseTenantRepository<T extends TenantEntity, CreateInput, UpdateInput, WhereInput, WhereUniqueInput> extends BaseRepository<T, CreateInput, UpdateInput, WhereInput, WhereUniqueInput> {
}
