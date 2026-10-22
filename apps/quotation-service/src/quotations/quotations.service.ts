import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Quotation, QuoteStatus, QuoteStatus as QuoteStatusEnum, Incoterm, Prisma } from '@prisma/client';
import { Inject } from '@nestjs/common';
import { CreateQuotationDto, UpdateQuotationDto, QuotationQueryDto, QuotationResponseDto, CreateQuotationItemDto, SendQuotationDto, RespondQuotationDto } from './dto/quotation.dto';
import { PaginatedResult } from '@cf-erp/shared';
import { rabbitMQClient, EventTypes } from '@cf-erp/messaging';

@Injectable()
export class QuotationsService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  async create(
    tenantId: string,
    branchId: string | undefined,
    userId: string,
    createQuotationDto: CreateQuotationDto,
  ): Promise<QuotationResponseDto> {
    const existingQuotation = await this.prisma.quotation.findUnique({
      where: { code_tenantId: { code: createQuotationDto.code, tenantId } },
    });

    if (existingQuotation) {
      throw new ConflictException('Quotation code already exists in this tenant');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { id: createQuotationDto.customerId, tenantId, isDeleted: false },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (createQuotationDto.supplierId) {
      const supplier = await this.prisma.supplier.findFirst({
        where: { id: createQuotationDto.supplierId, tenantId, isDeleted: false },
      });
      if (!supplier) {
        throw new NotFoundException('Supplier not found');
      }
    }

    if (createQuotationDto.validFrom >= createQuotationDto.validUntil) {
      throw new BadRequestException('Valid from must be before valid until');
    }

    const quotation = await this.prisma.$transaction(async (tx) => {
      let subtotal = new Prisma.Decimal(0);
      let taxAmount = new Prisma.Decimal(0);
      let discountAmount = new Prisma.Decimal(0);

      const newQuotation = await tx.quotation.create({
        data: {
          code: createQuotationDto.code,
          version: 1,
          status: QuoteStatus.DRAFT,
          customerId: createQuotationDto.customerId,
          supplierId: createQuotationDto.supplierId,
          validFrom: createQuotationDto.validFrom,
          validUntil: createQuotationDto.validUntil,
          incoterm: createQuotationDto.incoterm || Incoterm.FOB,
          paymentTerms: createQuotationDto.paymentTerms || 30,
          currency: createQuotationDto.currency || 'USD',
          exchangeRate: createQuotationDto.exchangeRate ? new Prisma.Decimal(createQuotationDto.exchangeRate) : new Prisma.Decimal(1),
          notes: createQuotationDto.notes,
          terms: createQuotationDto.terms,
          tenantId,
          branchId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      if (createQuotationDto.items && createQuotationDto.items.length > 0) {
        const itemsData = createQuotationDto.items.map(item => {
          const itemDiscountAmount = item.discountAmount ?? (item.unitPrice * item.quantity * (item.discountPercent || 0) / 100);
          const itemTaxAmount = item.taxAmount ?? ((item.unitPrice * item.quantity - itemDiscountAmount) * (item.taxPercent || 0) / 100);
          const itemTotalAmount = item.unitPrice * item.quantity - itemDiscountAmount + itemTaxAmount;

          subtotal = subtotal.add(new Prisma.Decimal(item.unitPrice * item.quantity));
          discountAmount = discountAmount.add(new Prisma.Decimal(itemDiscountAmount));
          taxAmount = taxAmount.add(new Prisma.Decimal(itemTaxAmount));

          return {
            quotationId: newQuotation.id,
            lineNumber: item.lineNumber,
            description: item.description,
            quantity: new Prisma.Decimal(item.quantity),
            unit: item.unit,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discountPercent: new Prisma.Decimal(item.discountPercent || 0),
            discountAmount: new Prisma.Decimal(itemDiscountAmount),
            taxPercent: new Prisma.Decimal(item.taxPercent || 0),
            taxAmount: new Prisma.Decimal(itemTaxAmount),
            totalAmount: new Prisma.Decimal(itemTotalAmount),
            commodityCode: item.commodityCode,
            weight: item.weight ? new Prisma.Decimal(item.weight) : null,
            volume: item.volume ? new Prisma.Decimal(item.volume) : null,
            origin: item.origin,
            destination: item.destination,
            metadata: item.metadata,
          };
        });

        await tx.quotationItem.createMany({ data: itemsData });
      }

      const totalAmount = subtotal.sub(discountAmount).add(taxAmount);

      return tx.quotation.update({
        where: { id: newQuotation.id },
        data: {
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
        },
        include: {
          items: true,
        },
      });
    });

    await this.publishEvent(EventTypes.QUOTATION.CREATED, quotation);

    return this.mapToResponse(quotation);
  }

  async findAll(
    tenantId: string,
    branchId: string | undefined,
    query: QuotationQueryDto,
  ): Promise<PaginatedResult<QuotationResponseDto>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.QuotationWhereInput = {
      tenantId,
      isDeleted: false,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (query.branchId) {
      where.branchId = query.branchId;
    }

    if (query.status) {
      where.status = query.status as QuoteStatus;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    if (query.validFrom) {
      where.validFrom = { gte: query.validFrom };
    }

    if (query.validUntil) {
      where.validUntil = { lte: query.validUntil };
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { customer: { name: { contains: query.search, mode: 'insensitive' } } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'desc' }
      : { createdAt: 'desc' };

    const [quotations, total] = await Promise.all([
      this.prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          items: true,
          customer: true,
          supplier: true,
        },
      }),
      this.prisma.quotation.count({ where }),
    ]);

    return {
      data: quotations.map(this.mapToResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(tenantId: string, id: string): Promise<QuotationResponseDto> {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        items: { orderBy: { lineNumber: 'asc' } },
        customer: true,
        supplier: true,
        rateCards: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return this.mapToResponse(quotation);
  }

  async update(
    tenantId: string,
    id: string,
    userId: string,
    updateQuotationDto: UpdateQuotationDto,
  ): Promise<QuotationResponseDto> {
    const quotation = await this.findById(tenantId, id);

    if (quotation.status !== QuoteStatus.DRAFT && quotation.status !== QuoteStatus.REVISED) {
      throw new BadRequestException('Can only update draft or revised quotations');
    }

    if (updateQuotationDto.validFrom && updateQuotationDto.validUntil) {
      if (updateQuotationDto.validFrom >= updateQuotationDto.validUntil) {
        throw new BadRequestException('Valid from must be before valid until');
      }
    }

    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        ...updateQuotationDto,
        exchangeRate: updateQuotationDto.exchangeRate ? new Prisma.Decimal(updateQuotationDto.exchangeRate) : undefined,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        items: { orderBy: { lineNumber: 'asc' } },
        customer: true,
        supplier: true,
      },
    });

    await this.publishEvent(EventTypes.QUOTATION.UPDATED, updatedQuotation);

    return this.mapToResponse(updatedQuotation);
  }

  async delete(tenantId: string, id: string, userId: string): Promise<void> {
    const quotation = await this.findById(tenantId, id);

    if (quotation.status === QuoteStatus.ACCEPTED || quotation.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('Cannot delete accepted or converted quotation');
    }

    await this.prisma.quotation.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    await this.publishEvent(EventTypes.QUOTATION.DELETED, { id, tenantId });
  }

  async send(tenantId: string, id: string, userId: string, sendQuotationDto: SendQuotationDto): Promise<QuotationResponseDto> {
    const quotation = await this.findById(tenantId, id);

    if (quotation.status !== QuoteStatus.DRAFT && quotation.status !== QuoteStatus.REVISED) {
      throw new BadRequestException('Can only send draft or revised quotations');
    }

    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuoteStatus.SENT,
        sentAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        items: { orderBy: { lineNumber: 'asc' } },
        customer: true,
        supplier: true,
      },
    });

    // Send email to recipients
    // await this.emailService.sendQuotation(updatedQuotation, sendQuotationDto.recipients);

    await this.publishEvent(EventTypes.QUOTATION.SENT, updatedQuotation);

    return this.mapToResponse(updatedQuotation);
  }

  async respond(tenantId: string, id: string, userId: string, respondQuotationDto: RespondQuotationDto): Promise<QuotationResponseDto> {
    const quotation = await this.findById(tenantId, id);

    if (quotation.status !== QuoteStatus.SENT && quotation.status !== QuoteStatus.VIEWED) {
      throw new BadRequestException('Can only respond to sent or viewed quotations');
    }

    const newStatus = respondQuotationDto.response === 'ACCEPTED' ? QuoteStatus.ACCEPTED : QuoteStatus.REJECTED;

    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        status: newStatus,
        respondedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        items: { orderBy: { lineNumber: 'asc' } },
        customer: true,
        supplier: true,
      },
    });

    await this.publishEvent(
      respondQuotationDto.response === 'ACCEPTED' ? EventTypes.QUOTATION.ACCEPTED : EventTypes.QUOTATION.REJECTED,
      updatedQuotation
    );

    return this.mapToResponse(updatedQuotation);
  }

  async revise(tenantId: string, branchId: string | undefined, userId: string, id: string): Promise<QuotationResponseDto> {
    const quotation = await this.findById(tenantId, id);

    if (quotation.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('Cannot revise converted quotation');
    }

    const newVersion = quotation.version + 1;
    const newCode = `${quotation.code}-V${newVersion}`;

    const revisedQuotation = await this.prisma.$transaction(async (tx) => {
      const newQuotation = await tx.quotation.create({
        data: {
          code: newCode,
          version: newVersion,
          status: QuoteStatus.DRAFT,
          customerId: quotation.customerId,
          supplierId: quotation.supplierId,
          validFrom: quotation.validFrom,
          validUntil: quotation.validUntil,
          incoterm: quotation.incoterm,
          paymentTerms: quotation.paymentTerms,
          currency: quotation.currency,
          exchangeRate: quotation.exchangeRate,
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          discountAmount: quotation.discountAmount,
          totalAmount: quotation.totalAmount,
          notes: quotation.notes,
          terms: quotation.terms,
          tenantId,
          branchId,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      const items = await tx.quotationItem.findMany({
        where: { quotationId: id },
      });

      await tx.quotationItem.createMany({
        data: items.map(item => ({
          quotationId: newQuotation.id,
          lineNumber: item.lineNumber,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          discountAmount: item.discountAmount,
          taxPercent: item.taxPercent,
          taxAmount: item.taxAmount,
          totalAmount: item.totalAmount,
          commodityCode: item.commodityCode,
          weight: item.weight,
          volume: item.volume,
          origin: item.origin,
          destination: item.destination,
          metadata: item.metadata,
        })),
      });

      await tx.quotation.update({
        where: { id },
        data: { status: QuoteStatus.REVISED, updatedBy: userId, updatedAt: new Date() },
      });

      return newQuotation;
    });

    await this.publishEvent(EventTypes.QUOTATION.REVISED, revisedQuotation);

    return this.findById(tenantId, revisedQuotation.id);
  }

  async convert(tenantId: string, id: string, userId: string, body: { jobId?: string; shipmentId?: string }): Promise<QuotationResponseDto> {
    const quotation = await this.findById(tenantId, id);

    if (quotation.status !== QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Can only convert accepted quotations');
    }

    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuoteStatus.CONVERTED,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      include: {
        items: { orderBy: { lineNumber: 'asc' } },
        customer: true,
        supplier: true,
      },
    });

    await this.publishEvent(EventTypes.QUOTATION.CONVERTED, {
      ...updatedQuotation,
      jobId: body.jobId,
      shipmentId: body.shipmentId,
    });

    return this.mapToResponse(updatedQuotation);
  }

  async getStats(tenantId: string, branchId: string | undefined): Promise<any> {
    const where: Prisma.QuotationWhereInput = { tenantId, isDeleted: false };
    if (branchId) where.branchId = branchId;

    const [total, draft, sent, viewed, accepted, rejected, expired, converted, totalValue] = await Promise.all([
      this.prisma.quotation.count({ where }),
      this.prisma.quotation.count({ where: { ...where, status: QuoteStatus.DRAFT } }),
      this.prisma.quotation.count({ where: { ...where, status: QuoteStatus.SENT } }),
      this.prisma.quotation.count({ where: { ...where, status: QuoteStatus.VIEWED } }),
      this.prisma.quotation.count({ where: { ...where, status: QuoteStatus.ACCEPTED } }),
      this.prisma.quotation.count({ where: { ...where, status: QuoteStatus.REJECTED } }),
      this.prisma.quotation.count({ where: { ...where, status: QuoteStatus.EXPIRED } }),
      this.prisma.quotation.count({ where: { ...where, status: QuoteStatus.CONVERTED } }),
      this.prisma.quotation.aggregate({ where, _sum: { totalAmount: true } }),
    ]);

    const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

    return {
      total,
      draft,
      sent,
      viewed,
      accepted,
      rejected,
      expired,
      converted,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalValue: totalValue._sum.totalAmount?.toNumber() || 0,
    };
  }

  private async publishEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    try {
      await rabbitMQClient.publish({
        eventId: crypto.randomUUID(),
        eventType,
        aggregateId: payload.id as string,
        aggregateType: 'QUOTATION',
        tenantId: payload.tenantId as string,
        branchId: payload.branchId as string,
        userId: payload.updatedBy as string || payload.createdBy as string,
        timestamp: new Date(),
        payload,
        version: 1,
      });
    } catch (error) {
      console.error('Failed to publish quotation event:', error);
    }
  }

  private mapToResponse(quotation: Quotation & {
    items?: any[];
    customer?: any;
    supplier?: any;
    rateCards?: any[];
  }): QuotationResponseDto {
    return {
      id: quotation.id,
      code: quotation.code,
      version: quotation.version,
      status: quotation.status,
      customerId: quotation.customerId,
      supplierId: quotation.supplierId,
      validFrom: quotation.validFrom,
      validUntil: quotation.validUntil,
      incoterm: quotation.incoterm,
      paymentTerms: quotation.paymentTerms,
      currency: quotation.currency,
      exchangeRate: quotation.exchangeRate.toNumber(),
      subtotal: quotation.subtotal.toNumber(),
      taxAmount: quotation.taxAmount.toNumber(),
      discountAmount: quotation.discountAmount.toNumber(),
      totalAmount: quotation.totalAmount.toNumber(),
      notes: quotation.notes,
      terms: quotation.terms,
      approvedBy: quotation.approvedBy,
      approvedAt: quotation.approvedAt,
      sentAt: quotation.sentAt,
      viewedAt: quotation.viewedAt,
      respondedAt: quotation.respondedAt,
      items: quotation.items?.map(item => ({
        id: item.id,
        lineNumber: item.lineNumber,
        description: item.description,
        quantity: item.quantity.toNumber(),
        unit: item.unit,
        unitPrice: item.unitPrice.toNumber(),
        discountPercent: item.discountPercent.toNumber(),
        discountAmount: item.discountAmount.toNumber(),
        taxPercent: item.taxPercent.toNumber(),
        taxAmount: item.taxAmount.toNumber(),
        totalAmount: item.totalAmount.toNumber(),
        commodityCode: item.commodityCode,
        weight: item.weight?.toNumber(),
        volume: item.volume?.toNumber(),
        origin: item.origin,
        destination: item.destination,
        metadata: item.metadata,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    };
  }
}