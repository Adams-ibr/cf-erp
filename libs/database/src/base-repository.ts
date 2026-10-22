import { PrismaClient, Prisma } from '@prisma/client';
import { prisma, PrismaTransactionClient } from './prisma-client';
import { FilterOptions, PaginatedResult, DateRange } from '@cf-erp/shared';

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

export abstract class BaseRepository<T extends TenantEntity, CreateInput, UpdateInput, WhereInput, WhereUniqueInput> {
  protected abstract model: PrismaClient[keyof PrismaClient];
  protected abstract modelName: string;

  protected get client(): PrismaClient {
    return prisma;
  }

  async findById(id: string, tenantId: string): Promise<T | null> {
    return this.model.findFirst({
      where: { id, tenantId, isDeleted: false },
    }) as Promise<T | null>;
  }

  async findByIdWithBranch(id: string, tenantId: string, branchId: string): Promise<T | null> {
    return this.model.findFirst({
      where: { id, tenantId, branchId, isDeleted: false },
    }) as Promise<T | null>;
  }

  async findAll(tenantId: string, options?: FilterOptions): Promise<PaginatedResult<T>> {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = {
      tenantId,
      isDeleted: false,
    };

    if (options?.branchId) {
      where.branchId = options.branchId;
    }

    if (options?.search) {
      where.OR = this.buildSearchConditions(options.search);
    }

    if (options?.filters) {
      Object.assign(where, options.filters);
    }

    const orderBy = options?.sortBy
      ? { [options.sortBy]: options.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: where as WhereInput,
        skip,
        take,
        orderBy: orderBy as Prisma.Enumerable<Prisma.SortOrder>,
      }),
      this.model.count({ where: where as WhereInput }),
    ]);

    return {
      data: data as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByTenant(tenantId: string, options?: FilterOptions): Promise<PaginatedResult<T>> {
    return this.findAll(tenantId, options);
  }

  async findByTenantAndBranch(tenantId: string, branchId: string, options?: FilterOptions): Promise<PaginatedResult<T>> {
    return this.findAll(tenantId, { ...options, branchId });
  }

  async create(data: CreateInput, tenantId: string, userId: string, branchId?: string): Promise<T> {
    const createData = {
      ...data,
      tenantId,
      branchId,
      createdBy: userId,
      updatedBy: userId,
      isDeleted: false,
    } as Prisma.Args<typeof this.model>['create']['data'];

    return this.model.create({ data: createData }) as Promise<T>;
  }

  async update(id: string, data: UpdateInput, tenantId: string, userId: string): Promise<T> {
    const updateData = {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    } as Prisma.Args<typeof this.model>['update']['data'];

    return this.model.update({
      where: { id },
      data: updateData,
    }) as Promise<T>;
  }

  async delete(id: string, tenantId: string, userId: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    }) as Promise<T>;
  }

  async softDelete(id: string, tenantId: string, userId: string): Promise<T> {
    return this.delete(id, tenantId, userId);
  }

  async restore(id: string, tenantId: string, userId: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    }) as Promise<T>;
  }

  async count(tenantId: string, filters?: Record<string, unknown>): Promise<number> {
    return this.model.count({
      where: {
        tenantId,
        isDeleted: false,
        ...filters,
      } as WhereInput,
    });
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id, tenantId, isDeleted: false },
    });
    return count > 0;
  }

  async existsInBranch(id: string, tenantId: string, branchId: string): Promise<boolean> {
    const count = await this.model.count({
      where: { id, tenantId, branchId, isDeleted: false },
    });
    return count > 0;
  }

  protected buildSearchConditions(search: string): Record<string, unknown>[] {
    return [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  async findManyByIds(ids: string[], tenantId: string): Promise<T[]> {
    return this.model.findMany({
      where: {
        id: { in: ids },
        tenantId,
        isDeleted: false,
      },
    }) as Promise<T[]>;
  }

  async bulkCreate(
    data: CreateInput[],
    tenantId: string,
    userId: string,
    branchId?: string,
  ): Promise<{ count: number }> {
    const createData = data.map(item => ({
      ...item,
      tenantId,
      branchId,
      createdBy: userId,
      updatedBy: userId,
      isDeleted: false,
    })) as Prisma.Args<typeof this.model>['createMany']['data'];

    return this.model.createMany({ data: createData });
  }

  async bulkUpdate(
    ids: string[],
    data: UpdateInput,
    tenantId: string,
    userId: string,
  ): Promise<{ count: number }> {
    const updateData = {
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    } as Prisma.Args<typeof this.model>['updateMany']['data'];

    return this.model.updateMany({
      where: { id: { in: ids }, tenantId, isDeleted: false },
      data: updateData,
    });
  }

  async bulkDelete(ids: string[], tenantId: string, userId: string): Promise<{ count: number }> {
    return this.model.updateMany({
      where: { id: { in: ids }, tenantId, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }
}

export abstract class BaseTenantRepository<T extends TenantEntity, CreateInput, UpdateInput, WhereInput, WhereUniqueInput>
  extends BaseRepository<T, CreateInput, UpdateInput, WhereInput, WhereUniqueInput> {
  // Tenant-specific methods can be added here
}