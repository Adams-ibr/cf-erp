import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, CustomsBroker, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateCustomsBrokerDto, UpdateCustomsBrokerDto, CustomsBrokerQueryDto, CustomsBrokerResponseDto } from './dto/customs-broker.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class CustomsBrokersService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createCustomsBrokerDto: CreateCustomsBrokerDto,
  ): Promise<CustomsBrokerResponseDto> {
    const existingBroker = await this.prisma.customsBroker.findUnique({
      where: { code_tenantId: { code: createCustomsBrokerDto.code, tenantId } },
    });

    if (existingBroker) {
      throw new ConflictException('Customs broker code already exists in this tenant');
    }

    const existingLicense = await this.prisma.customsBroker.findUnique({
      where: { licenseNumber_tenantId: { licenseNumber: createCustomsBrokerDto.licenseNumber, tenantId } },
    });

    if (existingLicense) {
      throw new ConflictException('License number already exists in this tenant');
    }

    const broker = await this.prisma.customsBroker.create({
      data: {
        code: createCustomsBrokerDto.code,
        name: createCustomsBrokerDto.name,
        licenseNumber: createCustomsBrokerDto.licenseNumber,
        licenseExpiry: createCustomsBrokerDto.licenseExpiry,
        contactPerson: createCustomsBrokerDto.contactPerson,
        email: createCustomsBrokerDto.email,
        phone: createCustomsBrokerDto.phone,
        address: createCustomsBrokerDto.address,
        rating: createCustomsBrokerDto.rating ? new Prisma.Decimal(createCustomsBrokerDto.rating) : null,
        isActive: createCustomsBrokerDto.isActive ?? true,
        isPreferred: createCustomsBrokerDto.isPreferred ?? false,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent('customs_broker.created', broker);

    return this.mapToResponse(broker);
  }

  async findAll(
    tenantId: string,
    query: CustomsBrokerQueryDto,
  ): Promise<PaginatedResult<CustomsBrokerResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.CustomsBrokerWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.isPreferred !== undefined) {
      where.isPreferred = query.isPreferred;
    }

    if (query.licenseNumber) {
      where.licenseNumber = query.licenseNumber;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { licenseNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { isPreferred: 'desc', name: 'asc' };

    const [brokers, total] = await Promise.all([
      this.prisma.customsBroker.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: { select: { entries: true } },
        },
      }),
      this.prisma.customsBroker.count({ where }),
    ]);

    return {
      data: brokers.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPreferred(tenantId: string): Promise<CustomsBrokerResponseDto[]> {
    const brokers = await this.prisma.customsBroker.findMany({
      where: { tenantId, isDeleted: false, isActive: true, isPreferred: true },
      orderBy: { rating: 'desc' },
    });

    return brokers.map(this.mapToResponse);
  }

  async findById(tenantId: string, id: string): Promise<CustomsBrokerResponseDto> {
    const broker = await this.prisma.customsBroker.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        _count: { select: { entries: true } },
      },
    });

    if (!broker) {
      throw new NotFoundException('Customs broker not found');
    }

    return this.mapToResponse(broker);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateCustomsBrokerDto: UpdateCustomsBrokerDto,
  ): Promise<CustomsBrokerResponseDto> {
    const broker = await this.findById(tenantId, id);

    if (updateCustomsBrokerDto.licenseNumber && updateCustomsBrokerDto.licenseNumber !== broker.licenseNumber) {
      const existingLicense = await this.prisma.customsBroker.findUnique({
        where: { licenseNumber_tenantId: { licenseNumber: updateCustomsBrokerDto.licenseNumber, tenantId } },
      });
      if (existingLicense) {
        throw new ConflictException('License number already exists in this tenant');
      }
    }

    const updatedBroker = await this.prisma.customsBroker.update({
      where: { id },
      data: {
        ...updateCustomsBrokerDto,
        rating: updateCustomsBrokerDto.rating ? new Prisma.Decimal(updateCustomsBrokerDto.rating) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('customs_broker.updated', updatedBroker);

    return this.mapToResponse(updatedBroker);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const broker = await this.findById(tenantId, id);

    const entries = await this.prisma.customsEntry.count({
      where: { brokerId: id, isDeleted: false },
    });

    if (entries > 0) {
      throw new ConflictException('Cannot delete customs broker with associated entries');
    }

    await this.prisma.customsBroker.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('customs_broker.deleted', { id, tenantId });
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<CustomsBrokerResponseDto> {
    const broker = await this.findById(tenantId, id);

    const updatedBroker = await this.prisma.customsBroker.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedBroker);
  }

  async setPreferred(tenantId: string, id: string, userId: string, isPreferred: boolean): Promise<CustomsBrokerResponseDto> {
    const broker = await this.findById(tenantId, id);

    const updatedBroker = await this.prisma.customsBroker.update({
      where: { id },
      data: {
        isPreferred,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedBroker);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'CUSTOMS_BROKER',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish customs broker event:', error);
    }
  }

  private mapToResponse(broker: CustomsBroker): CustomsBrokerResponseDto {
    return {
      id: broker.id,
      code: broker.code,
      name: broker.name,
      licenseNumber: broker.licenseNumber,
      licenseExpiry: broker.licenseExpiry,
      contactPerson: broker.contactPerson,
      email: broker.email,
      phone: broker.phone,
      address: broker.address as Record<string, unknown> | undefined,
      rating: broker.rating?.toNumber(),
      isActive: broker.isActive,
      isPreferred: broker.isPreferred,
      createdAt: broker.createdAt,
      updatedAt: broker.updatedAt,
    };
  }
}