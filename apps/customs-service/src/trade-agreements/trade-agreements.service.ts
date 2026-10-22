import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, TradeAgreement, TradeAgreementType, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateTradeAgreementDto, UpdateTradeAgreementDto, TradeAgreementQueryDto, TradeAgreementResponseDto } from './dto/trade-agreement.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient } from '@cf-erp/messaging';

@Injectable()
export class TradeAgreementsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    createTradeAgreementDto: CreateTradeAgreementDto,
  ): Promise<TradeAgreementResponseDto> {
    const existingAgreement = await this.prisma.tradeAgreement.findUnique({
      where: { code_tenantId: { code: createTradeAgreementDto.code, tenantId } },
    });

    if (existingAgreement) {
      throw new ConflictException('Trade agreement code already exists in this tenant');
    }

    const agreement = await this.prisma.tradeAgreement.create({
      data: {
        code: createTradeAgreementDto.code,
        name: createTradeAgreementDto.name,
        type: createTradeAgreementDto.type,
        countries: createTradeAgreementDto.countries,
        description: createTradeAgreementDto.description,
        validFrom: createTradeAgreementDto.validFrom,
        validUntil: createTradeAgreementDto.validUntil,
        preferentialDuty: createTradeAgreementDto.preferentialDuty ? new Prisma.Decimal(createTradeAgreementDto.preferentialDuty) : new Prisma.Decimal(0),
        rulesOfOrigin: createTradeAgreementDto.rulesOfOrigin,
        certificateRequired: createTradeAgreementDto.certificateRequired ?? true,
        isActive: true,
        tenantId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.publishEvent('trade_agreement.created', agreement);

    return this.mapToResponse(agreement);
  }

  async findAll(
    tenantId: string,
    query: TradeAgreementQueryDto,
  ): Promise<PaginatedResult<TradeAgreementResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TradeAgreementWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (query.type) {
      where.type = query.type as TradeAgreementType;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.country) {
      where.countries = { has: query.country };
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { validFrom: 'desc' };

    const [agreements, total] = await Promise.all([
      this.prisma.tradeAgreement.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tariffs: { include: { tariffCode: true } },
        },
      }),
      this.prisma.tradeAgreement.count({ where }),
    ]);

    return {
      data: agreements.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<TradeAgreementResponseDto> {
    const agreement = await this.prisma.tradeAgreement.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        tariffs: { include: { tariffCode: true } },
      },
    });

    if (!agreement) {
      throw new NotFoundException('Trade agreement not found');
    }

    return this.mapToResponse(agreement);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateTradeAgreementDto: UpdateTradeAgreementDto,
  ): Promise<TradeAgreementResponseDto> {
    const agreement = await this.findById(tenantId, id);

    const updatedAgreement = await this.prisma.tradeAgreement.update({
      where: { id },
      data: {
        ...updateTradeAgreementDto,
        preferentialDuty: updateTradeAgreementDto.preferentialDuty ? new Prisma.Decimal(updateTradeAgreementDto.preferentialDuty) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        tariffs: { include: { tariffCode: true } },
      },
    });

    await this.publishEvent('trade_agreement.updated', updatedAgreement);

    return this.mapToResponse(updatedAgreement);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const agreement = await this.findById(tenantId, id);

    const usageCount = await this.prisma.customsEntryLine.count({
      where: { tradeAgreementId: id },
    });

    if (usageCount > 0) {
      throw new ConflictException('Cannot delete trade agreement used in customs entries');
    }

    await this.prisma.tradeAgreement.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('trade_agreement.deleted', { id, tenantId });
  }

  async addTariff(
    tenantId: string,
    agreementId: string,
    userId: string,
    body: { tariffCodeId: string; preferentialRate: number; rulesOfOrigin?: Record<string, unknown>; notes?: string },
  ): Promise<any> {
    const agreement = await this.findById(tenantId, agreementId);

    if (!agreement.isActive) {
      throw new ConflictException('Cannot add tariffs to inactive trade agreement');
    }

    const tariffCode = await this.prisma.tariffCode.findFirst({
      where: { id: body.tariffCodeId, tenantId, isDeleted: false },
    });
    if (!tariffCode) {
      throw new NotFoundException('Tariff code not found');
    }

    const existingTariff = await this.prisma.tradeAgreementTariff.findUnique({
      where: { tradeAgreementId_tariffCodeId: { tradeAgreementId: agreementId, tariffCodeId: body.tariffCodeId } },
    });

    if (existingTariff) {
      throw new ConflictException('Tariff code already exists in this trade agreement');
    }

    const tariff = await this.prisma.tradeAgreementTariff.create({
      data: {
        tradeAgreementId: agreementId,
        tariffCodeId: body.tariffCodeId,
        preferentialRate: new Prisma.Decimal(body.preferentialRate),
        rulesOfOrigin: body.rulesOfOrigin,
        notes: body.notes,
        tenantId,
      },
      include: { tariffCode: true },
    });

    return tariff;
  }

  async removeTariff(tenantId: string, agreementId: string, tariffId: string, userId: string): Promise<void> {
    await this.findById(tenantId, agreementId);

    const tariff = await this.prisma.tradeAgreementTariff.findUnique({
      where: { tradeAgreementId_tariffCodeId: { tradeAgreementId: agreementId, tariffCodeId: tariffId } },
    });

    if (!tariff) {
      throw new NotFoundException('Tariff not found in this trade agreement');
    }

    await this.prisma.tradeAgreementTariff.delete({
      where: { id: tariff.id },
    });
  }

  async setActive(tenantId: string, id: string, userId: string, isActive: boolean): Promise<TradeAgreementResponseDto> {
    const agreement = await this.findById(tenantId, id);

    const updatedAgreement = await this.prisma.tradeAgreement.update({
      where: { id },
      data: {
        isActive,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        tariffs: { include: { tariffCode: true } },
      },
    });

    return this.mapToResponse(updatedAgreement);
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'TRADE_AGREEMENT',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish trade agreement event:', error);
    }
  }

  private mapToResponse(agreement: TradeAgreement & { tariffs?: any[] }): TradeAgreementResponseDto {
    return {
      id: agreement.id,
      code: agreement.code,
      name: agreement.name,
      type: agreement.type,
      countries: agreement.countries,
      description: agreement.description,
      isActive: agreement.isActive,
      validFrom: agreement.validFrom,
      validUntil: agreement.validUntil,
      preferentialDuty: agreement.preferentialDuty?.toNumber(),
      rulesOfOrigin: agreement.rulesOfOrigin as Record<string, unknown> | undefined,
      certificateRequired: agreement.certificateRequired,
      tariffs: agreement.tariffs?.map(t => ({
        id: t.id,
        tariffCodeId: t.tariffCodeId,
        preferentialRate: t.preferentialRate.toNumber(),
        rulesOfOrigin: t.rulesOfOrigin as Record<string, unknown> | undefined,
        notes: t.notes,
        tariffCode: t.tariffCode ? {
          id: t.tariffCode.id,
          code: t.tariffCode.code,
          description: t.tariffCode.description,
          dutyRate: t.tariffCode.dutyRate.toNumber(),
        } : undefined,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      createdAt: agreement.createdAt,
      updatedAt: agreement.updatedAt,
    };
  }
}