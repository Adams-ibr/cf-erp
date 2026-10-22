import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Rate, RateType, RateBasis, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateRateDto, UpdateRateDto, RateQueryDto, RateResponseDto } from './dto/rate.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class RatesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createRateDto: CreateRateDto,
  ): Promise<RateResponseDto> {
    const existingRate = await this.prisma.rate.findUnique({
      where: { code_tenantId: { code: createRateDto.code, tenantId } },
    });

    if (existingRate) {
      throw new ConflictException('Rate code already exists in this tenant');
    }

    if (createRateDto.validFrom >= createRateDto.validUntil) {
      throw new BadRequestException('Valid from must be before valid until');
    }

    if (createRateDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createRateDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    const rate = await this.prisma.rate.create({
      data: {
        code: createRateDto.code,
        name: createRateDto.name,
        type: createRateDto.type,
        basis: createRateDto.basis,
        currency: createRateDto.currency || 'USD',
        amount: new Prisma.Decimal(createRateDto.amount),
        minQuantity: createRateDto.minQuantity ? new Prisma.Decimal(createRateDto.minQuantity) : null,
        maxQuantity: createRateDto.maxQuantity ? new Prisma.Decimal(createRateDto.maxQuantity) : null,
        unit: createRateDto.unit,
        origin: createRateDto.origin,
        destination: createRateDto.destination,
        commodityCode: createRateDto.commodityCode,
        carrierId: createRateDto.carrierId,
        supplierId: createRateDto.supplierId,
        validFrom: createRateDto.validFrom,
        validUntil: createRateDto.validUntil,
        isSpot: createRateDto.isSpot || false,
        surcharges: createRateDto.surcharges,
        conditions: createRateDto.conditions,
        tenantId,
        branchId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent(EventTypes.RATE.CREATED, rate);

    return this.mapToResponse(rate);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: RateQueryDto,
  ): Promise<PaginatedResult<RateResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.RateWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.type) {
      where.type = query.type as RateType;
    }

    if (query.basis) {
      where.basis = query.basis as RateBasis;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.carrierId) {
      where.carrierId = query.carrierId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.isSpot !== undefined) {
      where.isSpot = query.isSpot;
    }

    if (query.origin) {
      where.origin = query.origin;
    }

    if (query.destination) {
      where.destination = query.destination;
    }

    if (query.commodityCode) {
      where.commodityCode = query.commodityCode;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [rates, total] = await Promise.all([
      this.prisma.rate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          supplier: true,
        },
      }),
      this.prisma.rate.count({ where }),
    ]);

    return {
      data: rates.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<RateResponseDto> {
    const rate = await this.prisma.rate.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        supplier: true,
        rateCardItems: { include: { rateCard: true } },
      },
    });

    if (!rate) {
      throw new NotFoundException('Rate not found');
    }

    return this.mapToResponse(rate);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateRateDto: UpdateRateDto,
  ): Promise<RateResponseDto> {
    const rate = await this.findById(tenantId, id);

    if (updateRateDto.validFrom && updateRateDto.validUntil) {
      if (updateRateDto.validFrom >= updateRateDto.validUntil) {
        throw new BadRequestException('Valid from must be before valid until');
      }
    }

    if (updateRateDto.supplierId && updateRateDto.supplierId !== rate.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: updateRateDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    const updatedRate = await this.prisma.rate.update({
      where: { id },
      data: {
        ...updateRateDto,
        amount: updateRateDto.amount ? new Prisma.Decimal(updateRateDto.amount) : undefined,
        minQuantity: updateRateDto.minQuantity ? new Prisma.Decimal(updateRateDto.minQuantity) : undefined,
        maxQuantity: updateRateDto.maxQuantity ? new Prisma.Decimal(updateRateDto.maxQuantity) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        supplier: true,
      },
    });

    await this.publishEvent(EventTypes.RATE.UPDATED, updatedRate);

    return this.mapToResponse(updatedRate);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const rate = await this.findById(tenantId, id);

    const rateCardItems = await this.prisma.rateCardItem.count({
      where: { rateId: id },
    });

    if (rateCardItems > 0) {
      throw new BadRequestException('Cannot delete rate used in rate cards');
    }

    await this.prisma.rate.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent(EventTypes.RATE.DELETED, { id, tenantId });
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<RateResponseDto> {
    const rate = await this.findById(tenantId, id);

    const updatedRate = await this.prisma.rate.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedRate);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'RATE',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish rate event:', error);
    }
  }

  private mapToResponse(rate: Rate & { supplier?: any }): RateResponseDto {
    return {
      id: rate.id,
      code: rate.code,
      name: rate.name,
      type: rate.type,
      basis: rate.basis,
      currency: rate.currency,
      amount: rate.amount.toNumber(),
      minQuantity: rate.minQuantity?.toNumber(),
      maxQuantity: rate.maxQuantity?.toNumber(),
      unit: rate.unit,
      origin: rate.origin,
      destination: rate.destination,
      commodityCode: rate.commodityCode,
      carrierId: rate.carrierId,
      supplierId: rate.supplierId,
      validFrom: rate.validFrom,
      validUntil: rate.validUntil,
      isActive: rate.isActive,
      isSpot: rate.isSpot,
      surcharges: rate.surcharges as Record<string, unknown> | undefined,
      conditions: rate.conditions as Record<string, unknown> | undefined,
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt,
    };
  }
}