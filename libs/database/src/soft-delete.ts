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

export function createSoftDeleteInput(userId: string): SoftDeleteInput {
  return {
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: userId,
  };
}

export function createRestoreInput(): RestoreInput {
  return {
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  };
}

export function addSoftDeleteWhere<T extends Record<string, unknown>>(where: T): T & { isDeleted: boolean } {
  return {
    ...where,
    isDeleted: false,
  };
}

export function addSoftDeleteToInclude<T extends Record<string, unknown>>(include: T): T {
  return include;
}

export const softDeleteMiddleware = async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<unknown>) => {
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    if (!params.args.where) {
      params.args.where = {};
    }
    params.args.where.isDeleted = false;
  }

  if (params.action === 'findMany') {
    if (!params.args.where) {
      params.args.where = {};
    }
    if (params.args.where.isDeleted === undefined) {
      params.args.where.isDeleted = false;
    }
  }

  if (params.action === 'update' || params.action === 'updateMany') {
    if (!params.args.where) {
      params.args.where = {};
    }
    if (params.args.where.isDeleted === undefined) {
      params.args.where.isDeleted = false;
    }
  }

  if (params.action === 'delete' || params.action === 'deleteMany') {
    params.action = params.action === 'delete' ? 'update' : 'updateMany';
    params.args.data = {
      ...params.args.data,
      isDeleted: true,
      deletedAt: new Date(),
    };
  }

  return next(params);
};

export function withSoftDelete<T extends { isDeleted?: boolean }>(
  model: {
    findUnique: (args: { where: T }) => Promise<T | null>;
    findFirst: (args: { where: T }) => Promise<T | null>;
    findMany: (args: { where: T }) => Promise<T[]>;
    update: (args: { where: T; data: Partial<T> }) => Promise<T>;
    updateMany: (args: { where: T; data: Partial<T> }) => Promise<{ count: number }>;
  },
) {
  return {
    async findUnique(where: T) {
      return model.findUnique({ where: { ...where, isDeleted: false } as T });
    },

    async findFirst(where: T) {
      return model.findFirst({ where: { ...where, isDeleted: false } as T });
    },

    async findMany(where: T) {
      return model.findMany({ where: { ...where, isDeleted: false } as T });
    },

    async update(where: T, data: Partial<T>) {
      return model.update({ where: { ...where, isDeleted: false } as T, data });
    },

    async updateMany(where: T, data: Partial<T>) {
      return model.updateMany({ where: { ...where, isDeleted: false } as T, data });
    },

    async softDelete(where: T, userId: string) {
      return model.updateMany({
        where: { ...where, isDeleted: false } as T,
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        } as Partial<T>,
      });
    },

    async restore(where: T) {
      return model.updateMany({
        where: { ...where, isDeleted: true } as T,
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        } as Partial<T>,
      });
    },
  };
}

export function createAuditFields(userId: string): { createdBy: string; updatedBy: string } {
  return {
    createdBy: userId,
    updatedBy: userId,
  };
}

export function updateAuditFields(userId: string): { updatedBy: string; updatedAt: Date } {
  return {
    updatedBy: userId,
    updatedAt: new Date(),
  };
}