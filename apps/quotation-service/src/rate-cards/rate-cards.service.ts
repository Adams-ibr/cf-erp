import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, RateCard, RateCardStatus, RateCardItem, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateRateCardDto, UpdateRateCardDto, AddRateCardItemDto, RateCardQueryDto, RateCardResponseDto } from './dto/rate-card.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class RateCardsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createRateCardDto: CreateRateCardDto,
  ): Promise<RateCardResponseDto> {
    const existingRateCard = await this.prisma.rateCard.findUnique({
      where: { code_tenantId: { code: createRateCardDto.code, tenantId } },
    });

    if (existingRateCard) {
      throw new ConflictException('Rate card code already exists in this tenant');
    }

    if (createRateCardDto.validFrom >= createRateCardDto.validUntil) {
      throw new BadRequestException('Valid from must be before valid until');
    }

    if (createRateCardDto.quotationId) {
      const quotation = await this.prisma.quotation.findFirst({
        where: { id: createRateCardDto.quotationId, tenantId, isDeleted: false },
      });
      if (!quotation) {
        throw new NotFoundException('Quotation not found');
      }
    }

    if (createRateCardDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createRateCardDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    const rateCard = await this.prisma.rateCard.create({
      data: {
        code: createRateCardDto.code,
        name: createRateCardDto.name,
        description: createRateCardDto.description,
        quotationId: createRateCardDto.quotationId,
        supplierId: createRateCardDto.supplierId,
        carrierId: createRateCardDto.carrierId,
        origin: createRateCardDto.origin,
        destination: createRateCardDto.destination,
        commodityCode: createRateCardDto.commodityCode,
        validFrom: createRateCardDto.validFrom,
        validUntil: createRateCardDto.validUntil,
        status: RateCardStatus.DRAFT,
        currency: createRateCardDto.currency || 'USD',
        exchangeRate: createRateCardDto.exchangeRate ? new Prisma.Decimal(createRateCardDto.exchangeRate) : new Prisma.Decimal(1),
        markupPercent: createRateCardDto.markupPercent ? new Prisma.Decimal(createRateCardDto.markupPercent) : new Prisma.Decimal(0),
        tenantId,
        branchId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        items: { include: { rate: true } },
      },
    });

    await this.publishEvent('rate_card.created', rateCard);

    return this.mapToResponse(rateCard);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: RateCardQueryDto,
  ): Promise<PaginatedResult<RateCardResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.RateCardWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.status) {
      where.status = query.status as RateCardStatus;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.carrierId) {
      where.carrierId = query.carrierId;
    }

    if (query.quotationId) {
      where.quotationId = query.quotationId;
    }

    if (query.origin) {
      where.origin = query.origin;
    }

    if (query.destination) {
      where.destination = query.destination;
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

    const [rateCards, total] = await Promise.all([
      this.prisma.rateCard.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          items: { include: { rate: true }, orderBy: { lineNumber: 'asc' } },
          supplier: true,
          quotation: true,
        },
      }),
      this.prisma.rateCard.count({ where }),
    ]);

    return {
      data: rateCards.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<RateCardResponseDto> {
    const rateCard = await this.prisma.rateCard.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        items: { include: { rate: true }, orderBy: { lineNumber: 'asc' } },
        supplier: true,
        quotation: true,
      },
    });

    if (!rateCard) {
      throw new NotFoundException('Rate card not found');
    }

    return this.mapToResponse(rateCard);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateRateCardDto: UpdateRateCardDto,
  ): Promise<RateCardResponseDto> {
    const rateCard = await this.findById(tenantId, id);

    if (rateCard.status !== RateCardStatus.DRAFT) {
      throw new BadRequestException('Can only update draft rate cards');
    }

    if (updateRateCardDto.validFrom && updateRateCardDto.validUntil) {
      if (updateRateCardDto.validFrom >= updateRateCardDto.validUntil) {
        throw new BadRequestException('Valid from must be before valid until');
      }
    }

    const updatedRateCard = await this.prisma.rateCard.update({
      where: { id },
      data: {
        ...updateRateCardDto,
        exchangeRate: updateRateCardDto.exchangeRate ? new Prisma.Decimal(updateRateCardDto.exchangeRate) : undefined,
        markupPercent: updateRateCardDto.markupPercent ? new Prisma.Decimal(updateRateCardDto.markupPercent) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        items: { include: { rate: true }, orderBy: { lineNumber: 'asc' } },
        supplier: true,
        quotation: true,
      },
    });

    await this.publishEvent('rate_card.updated', updatedRateCard);

    return this.mapToResponse(updatedRateCard);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const rateCard = await this.findById(tenantId, id);

    if (rateCard.status === RateCardStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete active rate card');
    }

    await this.prisma.rateCard.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent('rate_card.deleted', { id, tenantId });
  }

  async addItem(
    tenantId: string,
    rateCardId: string,
    userId: string,
    addRateCardItemDto: AddRateCardItemDto,
  ): Promise<RateCardItem> {
    const rateCard = await this.findById(tenantId, rateCardId);

    if (rateCard.status !== RateCardStatus.DRAFT) {
      throw new BadRequestException('Can only add items to draft rate cards');
    }

    const rate = await this.prisma.rate.findFirst({
      where: { id: addRateCardItemDto.rateId, isDeleted: false },
    });

    if (!rate) {
      throw new NotFoundException('Rate not found');
    }

    const existingItem = await this.prisma.rateCardItem.findUnique({
      where: { rateCardId_lineNumber: { rateCardId, lineNumber: addRateCardItemDto.lineNumber } },
    });

    if (existingItem) {
      throw new ConflictException('Line number already exists');
    }

    const unitPrice = rate.amount.toNumber();
    const markupPercent = addRateCardItemDto.markupPercent || 0;
    const markupAmount = (unitPrice * addRateCardItemDto.quantity * markupPercent) / 100;
    const totalAmount = unitPrice * addRateCardItemDto.quantity + markupAmount;

    const item = await this.prisma.rateCardItem.create({
      data: {
        rateCardId,
        rateId: addRateCardItemDto.rateId,
        lineNumber: addRateCardItemDto.lineNumber,
        quantity: new Prisma.Decimal(addRateCardItemDto.quantity),
        unit: addRateCardItemDto.unit,
        unitPrice: new Prisma.Decimal(unitPrice),
        markupPercent: new Prisma.Decimal(markupPercent),
        markupAmount: new Prisma.Decimal(markupAmount),
        totalAmount: new Prisma.Decimal(totalAmount),
        isIncluded: addRateCardItemDto.isIncluded ?? true,
        sortOrder: addRateCardItemDto.sortOrder || 0,
      },
      include: { rate: true },
    });

    await this.recalculateTotal(tenantId, rateCardId);

    return item;
  }

  async removeItem(tenantId: string, rateCardId: string, itemId: string, userId: string): Promise<void> {
    const rateCard = await this.findById(tenantId, rateCardId);

    if (rateCard.status !== RateCardStatus.DRAFT) {
      throw new BadRequestException('Can only remove items from draft rate cards');
    }

    const item = await this.prisma.rateCardItem.findFirst({
      where: { id: itemId, rateCardId },
    });

    if (!item) {
      throw new NotFoundException('Rate card item not found');
    }

    await this.prisma.rateCardItem.delete({ where: { id: itemId } });

    await this.recalculateTotal(tenantId, rateCardId);
  }

  async approve(tenantId: string, id: string, userId: string): Promise<RateCardResponseDto> {
    const rateCard = await this.findById(tenantId, id);

    if (rateCard.status !== RateCardStatus.DRAFT) {
      throw new BadRequestException('Can only approve draft rate cards');
    }

    if (rateCard.items.length === 0) {
      throw new BadRequestException('Cannot approve rate card with no items');
    }

    const updatedRateCard = await this.prisma.rateCard.update({
      where: { id },
      data: {
        status: RateCardStatus.ACTIVE,
        approvedBy: userId,
        approvedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        items: { include: { rate: true }, orderBy: { lineNumber: 'asc' } },
        supplier: true,
        quotation: true,
      },
    });

    await this.publishEvent('rate_card.approved', updatedRateCard);

    return this.mapToResponse(updatedRateCard);
  }

  async setStatus(tenantId: string, id: string, userId: string, status: 'ACTIVE' | 'EXPIRED' | 'ARCHIVED'): Promise<RateCardResponseDto> {
    const rateCard = await this.findById(tenantId, id);

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['ACTIVE', 'ARCHIVED'],
      ACTIVE: ['EXPIRED', 'ARCHIVED'],
      EXPIRED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    if (!validTransitions[rateCard.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${rateCard.status} to ${status}`);
    }

    const updatedRateCard = await this.prisma.rateCard.update({
      where: { id },
      data: {
        status: status as RateCardStatus,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        items: { include: { rate: true }, orderBy: { lineNumber: 'asc' } },
        supplier: true,
        quotation: true,
      },
    });

    await this.publishEvent('rate_card.status_changed', updatedRateCard);

    return this.mapToResponse(updatedRateCard);
  }

  private async recalculateTotal(tenantId: string, rateCardId: string): Promise<void> {
    const items = await this.prisma.rateCardItem.findMany({
      where: { rateCardId, isIncluded: true },
    });

    const totalAmount = items.reduce((sum, item) => sum.add(item.totalAmount), new Prisma.Decimal(0));

    await this.prisma.rateCard.update({
      where: { id: rateCardId },
      data: { totalAmount },
    });
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'RATE_CARD',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish rate card event:', error);
    }
  }

  private mapToResponse(rateCard: RateCard & { items?: (RateCardItem & { rate?: any })[] }): RateCardResponseDto {
    return {
      id: rateCard.id,
      code: rateCard.code,
      name: rateCard.name,
      description: rateCard.description,
      quotationId: rateCard.quotationId,
      supplierId: rateCard.supplierId,
      carrierId: rateCard.carrierId,
      origin: rateCard.origin,
      destination: rateCard.destination,
      commodityCode: rateCard.commodityCode,
      validFrom: rateCard.validFrom,
      validUntil: rateCard.validUntil,
      status: rateCard.status,
      currency: rateCard.currency,
      exchangeRate: rateCard.exchangeRate.toNumber(),
      markupPercent: rateCard.markupPercent.toNumber(),
      totalAmount: rateCard.totalAmount.toNumber(),
      items: rateCard.items?.map(item => ({
        id: item.id,
        rateId: item.rateId,
        lineNumber: item.lineNumber,
        quantity: item.quantity.toNumber(),
        unit: item.unit,
        unitPrice: item.unitPrice.toNumber(),
        markupPercent: item.markupPercent.toNumber(),
        markupAmount: item.markupAmount.toNumber(),
        totalAmount: item.totalAmount.toNumber(),
        isIncluded: item.isIncluded,
        sortOrder: item.sortOrder,
        rate: item.rate ? {
          id: item.rate.id,
          code: item.rate.code,
          name: item.rate.name,
          type: item.rate.type,
          basis: item.rate.basis,
          currency: item.rate.currency,
          amount: item.rate.amount.toNumber(),
          unit: item.rate.unit,
          origin: item.rate.origin,
          destination: item.rate.destination,
        } : undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      approvedBy: rateCard.approvedBy,
      approvedAt: rateCard.approvedAt,
      createdAt: rateCard.createdAt,
      updatedAt: rateCard.updatedAt,
    };
  }
}