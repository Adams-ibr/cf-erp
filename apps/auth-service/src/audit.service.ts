import { Injectable } from '@nestjs/common';
import { PrismaClient, AuditLog } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { AuditQueryDto, AuditLogResponseDto } from './dto/audit.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class AuditService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async log(data: {
    tenantId: string;
    branchId?: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        tenantId: data.tenantId,
        branchId: data.branchId,
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
      },
    });
  }

  async query(tenantId: string, query: AuditQueryDto): Promise<PaginatedResult<AuditLogResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
    };

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.resource) {
      where.resource = query.resource;
    }

    if (query.resourceId) {
      where.resourceId = query.resourceId;
    }

    if (query.dateRange) {
      where.createdAt = {
        gte: query.dateRange.startDate,
        lte: query.dateRange.endDate,
      };
    }

    const orderBy = { createdAt: 'desc' };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async export(tenantId: string, query: AuditQueryDto): Promise<Buffer> {
    const where: any = {
      tenantId,
    };

    if (query.branchId) where.branchId = query.branchId;
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.resource) where.resource = query.resource;
    if (query.resourceId) where.resourceId = query.resourceId;
    if (query.dateRange) {
      where.createdAt = {
        gte: query.dateRange.startDate,
        lte: query.dateRange.endDate,
      };
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    // Generate CSV
    const headers = ['ID', 'Timestamp', 'User ID', 'Action', 'Resource', 'Resource ID', 'IP Address', 'User Agent'];
    const rows = logs.map(log => [
      log.id,
      log.createdAt.toISOString(),
      log.userId || '',
      log.action,
      log.resource,
      log.resourceId || '',
      log.ipAddress || '',
      log.userAgent || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    return Buffer.from(csv, 'utf-8');
  }

  private mapToResponse(log: AuditLog): AuditLogResponseDto {
    return {
      id: log.id,
      tenantId: log.tenantId,
      branchId: log.branchId,
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      oldValues: log.oldValues as Record<string, unknown> | undefined,
      newValues: log.newValues as Record<string, unknown> | undefined,
      metadata: log.metadata as Record<string, unknown> | undefined,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      createdAt: log.createdAt,
    };
  }
}

export class AuditQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiPropertyOptional()
  branchId?: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  resource: string;

  @ApiPropertyOptional()
  resourceId?: string;

  @ApiPropertyOptional()
  oldValues?: Record<string, unknown>;

  @ApiPropertyOptional()
  newValues?: Record<string, unknown>;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  sessionId?: string;

  @ApiProperty()
  createdAt: Date;
}