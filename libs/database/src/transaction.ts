import { PrismaClient, Prisma } from '@prisma/client';
import { prisma, PrismaTransactionClient, withTransaction } from './prisma-client';

export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

export class TransactionManager {
  private client: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.client = client;
  }

  async execute<T>(
    callback: (tx: PrismaTransactionClient) => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    return this.client.$transaction(callback, {
      maxWait: options.maxWait || 5000,
      timeout: options.timeout || 10000,
      isolationLevel: options.isolationLevel || Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  }

  async executeSequential<T>(
    callbacks: Array<(tx: PrismaTransactionClient) => Promise<T>>,
    options: TransactionOptions = {},
  ): Promise<T[]> {
    return this.client.$transaction(callbacks, {
      maxWait: options.maxWait || 5000,
      timeout: options.timeout || 10000,
      isolationLevel: options.isolationLevel || Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  }
}

export const transactionManager = new TransactionManager();

export async function runInTransaction<T>(
  callback: (tx: PrismaTransactionClient) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> {
  return transactionManager.execute(callback, options);
}

export class UnitOfWork {
  private operations: Array<() => Promise<unknown>> = [];
  private committed = false;

  addOperation(operation: () => Promise<unknown>): void {
    if (this.committed) {
      throw new Error('Unit of work already committed');
    }
    this.operations.push(operation);
  }

  async commit(): Promise<void> {
    if (this.committed) {
      throw new Error('Unit of work already committed');
    }
    this.committed = true;

    await prisma.$transaction(async (tx) => {
      for (const operation of this.operations) {
        await operation();
      }
    });
  }

  async rollback(): Promise<void> {
    this.operations = [];
    this.committed = false;
  }
}

export function createUnitOfWork(): UnitOfWork {
  return new UnitOfWork();
}

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<{ data: T[]; total: number }>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}