import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, TariffCode, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateTariffCodeDto, UpdateTariffCodeDto, TariffCodeQueryDto, TariffCodeResponseDto } from './dto/tariff-code.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class TariffCodesService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createTariffCodeDto: CreateTariffCodeDto,
  ): Promise<TariffCodeResponseDto> {
    const existingCode = await this.prisma.tariffCode.findUnique({
      where: { code_countryCode_tenantId: { code: createTariffCodeDto.code, countryCode: createTariffCodeDto.countryCode || 'US', tenantId } },
    });

    if (existingCode) {
      throw new ConflictException('Tariff code already exists for this country in this tenant');
    }

    if (createTariffCodeDto.parentId) {
      const parent = await this.prisma.tariffCode.findFirst({
        where: { id: createTariffCodeDto.parentId, tenantId, isDeleted: false },
      });
      if (!parent) {
        throw new NotFoundException('Parent tariff code not found');
      }
    }

    const tariffCode = await this.prisma.tariffCode.create({
      data: {
        code: createTariffCodeDto.code,
        description: createTariffCodeDto.description,
        chapter: createTariffCodeDto.chapter,
        heading: createTariffCodeDto.heading,
        subheading: createTariffCodeDto.subheading,
        unit: createTariffCodeDto.unit,
        dutyRate: new Prisma.Decimal(createTariffCodeDto.dutyRate),
        taxRate: createTariffCodeDto.taxRate ? new Prisma.Decimal(createTariffCodeDto.taxRate) : new Prisma.Decimal(0),
        isActive: createTariffCodeDto.isActive ?? true,
        validFrom: createTariffCodeDto.validFrom,
        validUntil: createTariffCodeDto.validUntil,
        parentId: createTariffCodeDto.parentId,
        countryCode: createTariffCodeDto.countryCode || 'US',
        notes: createTariffCodeDto.notes,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent('tariff_code.created', tariffCode);

    return this.mapToResponse(tariffCode);
  }

  async findAll(
    tenantId: string,
    query: TariffCodeQueryDto,
  ): Promise<PaginatedResult<TariffCodeResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TariffCodeWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.chapter) {
      where.chapter = query.chapter;
    }

    if (query.heading) {
      where.heading = query.heading;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.countryCode) {
      where.countryCode = query.countryCode;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { code: 'asc' };

    const [tariffCodes, total] = await Promise.all([
      this.prisma.tariffCode.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tradeAgreements: { include: { tradeAgreement: true } },
          children: true,
        },
      }),
      this.prisma.tariffCode.count({ where }),
    ]);

    return {
      data: tariffCodes.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(
    tenantId: string,
    keyword: string,
    limit = 10,
  ): Promise<TariffCodeResponseDto[]> {
    const tariffCodes = await this.prisma.tariffCode.findMany({
      where: {
        tenantId,
        isDeleted: false,
        isActive: true,
        OR: [
          { code: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { code: 'asc' },
    });

    return tariffCodes.map(this.mapToResponse);
  }

  async findById(tenantId: string, id: string): Promise<TariffCodeResponseDto> {
    const tariffCode = await this.prisma.tariffCode.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        tradeAgreements: { include: { tradeAgreement: true } },
        children: true,
      },
    });

    if (!tariffCode) {
      throw new NotFoundException('Tariff code not found');
    }

    return this.mapToResponse(tariffCode);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateTariffCodeDto: UpdateTariffCodeDto,
  ): Promise<TariffCodeResponseDto> {
    const tariffCode = await this.findById(tenantId, id);

    const updatedTariffCode = await this.prisma.tariffCode.update({
      where: { id },
      data: {
        ...updateTariffCodeDto,
        dutyRate: updateTariffCodeDto.dutyRate ? new Prisma.Decimal(updateTariffCodeDto.dutyRate) : undefined,
        taxRate: updateTariffCodeDto.taxRate ? new Prisma.Decimal(updateTariffCodeDto.taxRate) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('tariff_code.updated', updatedTariffCode);

    return this.mapToResponse(updatedTariffCode);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const tariffCode = await this.findById(tenantId, id);

    const usageCount = await this.prisma.customsEntryLine.count({
      where: { tariffCodeId: id },
    });

    if (usageCount > 0) {
      throw new ConflictException('Cannot delete tariff code used in customs entries');
    }

    await this.prisma.tariffCode.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('tariff_code.deleted', { id, tenantId });
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<TariffCodeResponseDto> {
    const tariffCode = await this.findById(tenantId, id);

    const updatedTariffCode = await this.prisma.tariffCode.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedTariffCode);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'TARIFF_CODE',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish tariff code event:', error);
    }
  }

  private mapToResponse(tariffCode: TariffCode & { tradeAgreements?: any[]; children?: any[] }): TariffCodeResponseDto {
    return {
      id: tariffCode.id,
      code: tariffCode.code,
      description: tariffCode.description,
      chapter: tariffCode.chapter,
      heading: tariffCode.heading,
      subheading: tariffCode.subheading,
      unit: tariffCode.unit,
      dutyRate: tariffCode.dutyRate.toNumber(),
      taxRate: tariffCode.taxRate?.toNumber(),
      isActive: tariffCode.isActive,
      validFrom: tariffCode.validFrom,
      validUntil: tariffCode.validUntil,
      parentId: tariffCode.parentId,
      countryCode: tariffCode.countryCode,
      notes: tariffCode.notes,
      createdAt: tariffCode.createdAt,
      updatedAt: tariffCode.updatedAt,
    };
  }
}