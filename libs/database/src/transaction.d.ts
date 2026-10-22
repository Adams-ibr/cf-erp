import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaTransactionClient } from './prisma-client';
export interface TransactionOptions {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
}
export declare class TransactionManager {
    private client;
    constructor(client?: PrismaClient);
    execute<T>(callback: (tx: PrismaTransactionClient) => Promise<T>, options?: TransactionOptions): Promise<T>;
    executeSequential<T>(callbacks: Array<(tx: PrismaTransactionClient) => Promise<T>>, options?: TransactionOptions): Promise<T[]>;
}
export declare const transactionManager: TransactionManager;
export declare function runInTransaction<T>(callback: (tx: PrismaTransactionClient) => Promise<T>, options?: TransactionOptions): Promise<T>;
export declare class UnitOfWork {
    private operations;
    private committed;
    addOperation(operation: () => Promise<unknown>): void;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
export declare function createUnitOfWork(): UnitOfWork;
export interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(options?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: T[];
        total: number;
    }>;
    create(data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}
