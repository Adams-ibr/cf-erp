import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Activity, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateActivityDto, ActivityQueryDto, ActivityResponseDto } from './dto/activity.dto';
import { PaginatedResult } from '@cf-erp/shared';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createActivityDto: CreateActivityDto,
  ): Promise<ActivityResponseDto> {
    if (!createActivityDto.customerId && !createActivityDto.supplierId) {
      throw new BadRequestException('Activity must belong to either a customer or supplier');
    }

    if (createActivityDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: createActivityDto.customerId, tenantId, isDeleted: false },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    if (createActivityDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createActivityDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    const activity = await this.prisma.activity.create({
      data: {
        ...createActivityDto,
        tenantId,
        userId,
      },
    });

    return this.mapToResponse(activity);
  }

  async findAll(tenantId: string, query: ActivityQueryDto): Promise<PaginatedResult<ActivityResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityWhereInput = {
      tenantId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      data: activities.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<ActivityResponseDto> {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return this.mapToResponse(activity);
  }

  private mapToResponse(activity: Activity): ActivityResponseDto {
    return {
      id: activity.id,
      type: activity.type,
      subject: activity.subject,
      description: activity.description,
      metadata: activity.metadata as Record<string, unknown> | undefined,
      customerId: activity.customerId,
      supplierId: activity.supplierId,
      userId: activity.userId,
      createdAt: activity.createdAt,
    };
  }
}